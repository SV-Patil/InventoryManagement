Vue.component('search_ind', {
    template: `
    <div style="margin-left:30%;">
    <p>
        <label>Medicine name:</label> <input type="text" class="form-control" v-model="input" v-on:input="cal_med" style="width:300px;">
        <span v-on:click="find(input)"><i class="bi bi-search h3"></i></span>
    </p>
    <ul>
        <li v-for="med in suggested"> <a v-on:click="input=med">{{med}}</a> </li>
    </ul>
    <div v-show="show_res" id="result">
    </div>
    </div>`
    ,
    data: function(){
        return{
            input : "",
            suggested: [],
            show_res: false,
            dis:{}
        }
    },
    methods:{
        cal_med: function(){
            if(this.input==""){
                this.suggested=[];
            }
            else{
                fetch("/search_for/del/"+this.input)
                .then(response => response.json()
                .then(result => this.suggested=result["Medicine name"]))
                .catch(err => console.log(err))
            }
        },
        write: function(res){
            console.log(res)
            document.getElementById("result").innerHTML = `<div id="inn" style="border:2px dotted black;padding:5px;width:50%;"><br></div>`
            for (const key in res) {
                if (res.hasOwnProperty(key)) {
                    document.getElementById("inn").innerHTML += `<p><b><u>${key}</u> :</b> ${res[key]}</p>`;
                }
            }
        },
        find: function(med){
            this.suggested=[];
            this.show_res=true;
            //let medi = med.split(' | ')
            fetch("/search_for/del/"+med)
                .then(response => response.json()
                .then(result => this.write(result)))
                .catch(err => console.log(err))
        },
        fetchMedicineInfo: function(code) {
            fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 1) {
                    const product = data.product;
                    document.getElementById('result').innerText += `\nProduct: ${product.product_name}, Brand: ${product.brands}, Ingredients: ${product.ingredients_text}`;
                } else {
                    document.getElementById('result').innerText += "\nProduct not found.";
                }
            })
            .catch(error => console.error('Error fetching medicine info:', error));
        },
    }
})

var app = new Vue({
    el: "#app2"
})   