from flask import Flask, url_for, render_template, request, redirect, jsonify, send_file
from sqlalchemy.orm import declarative_base
from flask_sqlalchemy import SQLAlchemy
import os
from datetime import date, timedelta,datetime
import requests
import matplotlib.pyplot as plt
import io
from flask_cors import CORS

current_dir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///" + os.path.join(current_dir, "medi.sqlite3")
db = SQLAlchemy()
db.init_app(app)
app.app_context().push()


class Medicine(db.Model):
    __tablename__ = 'medicine'
    mid = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    descp = db.Column(db.String, nullable=False)
    price = db.Column(db.Integer, nullable=False)
    date_cr = db.Column(db.Date, nullable=False)
    mrp = db.Column(db.Integer, nullable=False)
    stock = db.Column(db.Integer)

class Sale(db.Model):
    __tablename__ = 'sale'
    sid = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    mid = db.Column(db.Integer, db.ForeignKey(Medicine.mid))
    amt = db.Column(db.Integer, nullable=False)

class Inventory(db.Model):
    __tablename__ = 'inventory'
    in_date = db.Column(db.Date, primary_key=True)
    m_id = db.Column(db.Integer, primary_key=True)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Integer, nullable=False)
    expiry = db.Column(db.Date)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/dashboard')
def dash():
    temp = Medicine.query.all()
    med_dict = {}
    for i in temp:
        med_dict[int(i.mid)] = i.name
        
    yesterday = date.today() - timedelta(days=1)
    yes_list = Sale.query.filter_by(date=yesterday).all()
    return render_template('userpage.html',yes_list=yes_list,med_dict=med_dict)

@app.route('/add',methods=['GET','POST'])
def add():
    if request.method =='GET':
        return render_template('add.html')
    else:
        name = request.form['name']
        price = request.form['price']
        desp = request.form['des']
        mrp = request.form['mrp']
        datem = request.form['date']
        new_name = name.replace(' ','_')
        datel = datetime.strptime(datem,"%Y-%m-%d")
        #datel.replace(year=int(datem[:4]), month=int(datem[5:7]),day=int(datem[8:]))
        print(datem)
        print(type(datel))
        new_m = Medicine(name=new_name,price=price,descp=desp,date_cr=datel,mrp=mrp,stock=0)
        db.session.add(new_m)
        db.session.commit()
        return redirect(url_for('dash'))

@app.route('/remove/<delname>', methods=['GET'])
def remove(delname):
    if delname=="get":
        return render_template('remove.html')
    else:
        print(delname)
        del_m = Medicine.query.filter_by(name=delname).first()
        db.session.delete(del_m)
        db.session.commit()
        return redirect('/remove/get')

@app.route('/search_for/<task>/<namem>',methods=['GET'])
def sear(task,namem):
    if task == 'del':
        lis = Medicine.query.filter(Medicine.name.op("LIKE")("%"+namem.replace(' ','_')+"%")).all()
        result = {"Medicine name":[],"MRP of the medicine":[],"Description of medicine":[],"Date when added to the store":[],"Current stock":[]}
        for obj in lis:
            result["MRP of the medicine"].append(obj.mrp)
            result["Description of medicine"].append(obj.descp)
            result["Date when added to the store"].append(obj.date_cr)
            result["Medicine name"].append(obj.name.replace('_',' '))
            result["Current stock"].append(obj.stock)
        return result
    else:
        try:
            datel = datetime.strptime(namem,"%Y-%m-%d").date()
            lis = Sale.query.filter_by(date=datel).all()
            result = {"1Date":datel,"3Amount":[],"2name":[]}
            for obj in lis:
                med = Medicine.query.filter_by(mid=obj.mid).first()
                result["2name"].append(med.name.replace('_',' '))
                result["3Amount"].append(obj.amt)
            return result
        except ValueError:
            temp_id = Medicine.query.filter_by(name=namem.replace(' ','_')).first().mid
            lis = Sale.query.filter_by(mid=temp_id).all()
            result = {"1Date":[],"3Amount":[],"2name":namem}
            for obj in lis:
                result["1Date"].append(obj.date)
                result["3Amount"].append(obj.amt)
            return result

@app.route('/search')
def search():
    return render_template('search.html')

@app.route('/mg1_api')
def get_info():
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"}
    url = 'https://api.fda.gov/drug/ndc.json?search=package.ndc11:003780150486'
    response = requests.get(url)
    #print(response.json())
    #oup = soup(response.content, 'xml')
    return redirect('/search')

@app.route('/inven',methods=['GET'])
def inventory():
    entries = Inventory.query.order_by(Inventory.in_date.desc()).all()
    grp = Inventory.query.with_entities(Inventory.in_date).distinct().order_by(Inventory.in_date.desc())
    to_be_expired = []
    for i in entries:
        if i.expiry > date.today() and i.expiry < date.today()+timedelta(days=30) and i.m_id not in [k.m_id for k in to_be_expired]:
            to_be_expired.append(i)
    temp = Medicine.query.all()
    med_list = {}
    for i in temp:
        med_list[int(i.mid)] = [i.name,i.stock]
    return render_template('inventory.html',entries=entries,grp=grp,med_list=med_list,ex=to_be_expired)

@app.route('/create_in',methods=['GET','POST'])
def new():
    if request.method == 'GET':
        temp = Medicine.query.all()
        med_list = []
        for i in temp:
            d = {'mid':i.mid,'name':i.name  }
            med_list.append(d)
        return render_template('create_in.html',med_list=med_list)
    else:
        data = request.get_json()
        datem = data['date']

        datel = datetime.strptime(datem,'%Y-%m-%d')
        print(datel)
        for i in range(0,len(data['selected_med_list'])):
            sample_date_ex = data['selected_ex_list'][i]
            date_ex = date(year=int(sample_date_ex[:4]), 
                        month=int(sample_date_ex[5:7]), 
                        day=int(sample_date_ex[8:]))
            target_m = Medicine.query.filter_by(mid=data['selected_med_list'][i]).first()
            tprice = int(data['selected_quantity_list'][i]) * target_m.price
            new_in = Inventory(in_date=datel,
                                m_id=data['selected_med_list'][i],
                                quantity=int(data['selected_quantity_list'][i]),
                                price=tprice,
                                expiry=date_ex)
            db.session.add(new_in)

            target_m.stock += int(data['selected_quantity_list'][i])
            db.session.commit()
        
        response = {'message': 'Data received successfully', 'data': data}
        return redirect('/create_in')

@app.route('/sale',methods=['GET','POST'])
def sale():
    if request.method == 'GET':
        temp = Medicine.query.all()
        med_list = []
        med_dict = {}
        for i in temp:
            med_dict[int(i.mid)] = i.name
            d = {'mid':i.mid,'name':i.name,'price':i.price}
            med_list.append(d)
        
        
        return render_template('sale_page.html',med_list=med_list,med_dict=med_dict)
    else:
        datem = request.form['date']
        m_id = request.form.get('mid_form')
        quantity = request.form['quan']
        amt = request.form['amt']
        datel = date(year=int(datem[:4]), 
                        month=int(datem[5:7]), 
                        day=int(datem[8:]))
        new_sale = Sale(date=datel,mid=int(m_id.split('|')[0]),amt=amt)
        db.session.add(new_sale)
        target_m = Medicine.query.filter_by(mid=int(m_id.split('|')[0])).first()
        print(type(quantity))
        target_m.stock -= int(quantity)
        db.session.commit()
        return redirect('/sale')

@app.route('/data/<typ>')
def data(typ):
    if typ=='bar':
        bar_dict = {}
        profit = {}
        for i in range(1,8):
            curr_day = date.today() - timedelta(days=i)
            sale_list = Sale.query.filter_by(date=curr_day).all()
            summ = [i.amt for i in sale_list]
            bar_dict[curr_day.strftime('%d-%b-%Y')] = sum(summ)
            pr_list=[]
            for k in sale_list:
                temp_med = Medicine.query.filter_by(mid=k.mid).first()
                pft = (temp_med.mrp - temp_med.price)*(k.amt/temp_med.mrp)
                pr_list.append(abs(int(pft)))
            profit[curr_day.strftime('%d-%b-%Y')] = sum(pr_list)
        
        data ={'labels': list(bar_dict.keys()),
            'dataset1': list(bar_dict.values()),
            'dataset2': list(profit.values())}
        
        return jsonify(data)
    elif typ=='pie':
        pie_dict = {}
        results = db.session.query(Sale.mid,db.func.sum(Sale.amt).label('total_amount')).group_by(Sale.mid).all()
        results.sort(key = lambda x: x[1],reverse=True)
        for res in results[:5]:
            mname = Medicine.query.filter_by(mid=res.mid).first().name
            pie_dict[mname] =  res.total_amount
        return pie_dict

if __name__ == '__main__':
    app.run(debug=True)