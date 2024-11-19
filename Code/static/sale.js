var app = new Vue({
    el:'#app',
    data: function(){
        return{
            selected_cat:'',
            input:null,
            suggested:[],
            show_res:false,
            quan:1
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
        write: function(val,res){
            const len = res['3Amount'].length;
            if(val=='med'){
                if(len == 0){
                    document.getElementById("result").innerHTML = `<b>No sales record inserted for this data</b>`
                }
                else{
                document.getElementById("result").innerHTML = 
                    `<table id="inn"><tr>
                    <th> Date </th>
                    <th> Name </th>
                    <th> Amount </th>
                    </tr></table>`
                for (let i=0; i<len; i++) {
                    document.getElementById("inn").innerHTML += `<tr id=${i}> </tr>`;
                    for(const key in res){
                        if (key != '2name') {
                            document.getElementById(i).innerHTML += `<td>${res[key][i]}</td>`;
                        }
                        else{
                            document.getElementById(i).innerHTML += `<td>${res[key]}</td>`;
                        }
                    }
                }
                }
            }
            else{
                if(len == 0){
                    document.getElementById("result").innerHTML = `<b>No sales record inserted for this data</b>`
                }
                else{
                document.getElementById("result").innerHTML = 
                    `<table id="inn"><tr>
                    <th> Date </th>
                    <th> Name </th>
                    <th> Amount </th>
                    </tr></table>`
                for (let i=0; i<len; i++) {
                    document.getElementById("inn").innerHTML += `<tr id=${i}> </tr>`;
                    for(const key in res){
                        if (key != '1Date') {
                            document.getElementById(i).innerHTML += `<td>${res[key][i]}</td>`;
                        }
                        else{
                            document.getElementById(i).innerHTML += `<td>${res[key]}</td>`;
                        }
                    }
                }
                }
            }
        },
        find: function(inp){
            this.show_res=true;
            if(this.selected_cat=='Medicine Name'){
                this.suggested=[];
                fetch("/search_for/sale/"+inp)
                    .then(response => response.json()
                    .then(result => this.write('med',result)))
                    .catch(err => console.log(err))
                console.log("zal")
            }
            else{
                fetch("/search_for/sale/"+inp)
                    .then(response => response.json()
                    .then(result => this.write('date',result)))
                    .catch(err => console.log(err))
                console.log("zal")
            }
        }
    },
    delimiters:['[[',']]']
})