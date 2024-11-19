Vue.component('medlist', {
    template: `
    <div style="margin-left:40%;">
    <p>Medicine name: <input class="form-control" type="text" v-model="input" v-on:input="cal_med" style="width:300px;">
     <button v-on:click="select" style="padding: 10px 25px;
            margin-top:10px;
            background-color:#a0c9e7;
            color: #384e71;"><b>Select</b></button>
    </p>
    <ul>
        <li v-for="med in suggested"> <a v-on:click="input=med">{{med}}</a> </li>
    </ul>
    <p> Total medicines selected: {{count}}</p>
    <br>
    <ul>
        <li v-for="med in selected"> <b>{{med}}</b> 
            <span v-on:click="rm_slt(med)"><i class="bi bi-x-square h3"></i></span>
        </li>
    </ul>
    
    <button type="submit" v-on:click="go_to_del" style="padding: 10px 25px;
            margin-top:10px;
            background-color:#a0c9e7;
            color: #384e71;"><b> Remove </b></button> </a>
    </div>`
    ,
    data: function(){
        return{
            input : "",
            selected : [],
            suggested: []
        }
    },
    methods:{
        select: function(){
            console.log("entered select")
            this.selected.push(this.input.split(' | ')[0]);
            this.input="";
        },
        cal_med: function(){
            console.log("entered cal med")
            if(this.input==""){
                this.suggested=[];
            }
            else{
                console.log(this.input)
                fetch("/search_for/del/"+this.input)
                .then(response => response.json()
                .then(result => this.suggested=result["Medicine name"]))
                .catch(err => console.log(err))
            }
        },
        go_to_del: function(){
            console.log("entered delete funct")
            for(let k=0;k<this.selected.length;k++){
                console.log(this.selected[k])
                fetch("/remove/"+this.selected[k])
            }
            this.selected=[];
            this.suggested=[];
        },
        rm_slt: function(value) {
            var index = this.selected.indexOf(value);
            if (index > -1) {
              this.selected.splice(index, 1);
            }
          }
    },
    computed:{
        count:function(){
            return this.selected.length;
        }
    }
})

var app = new Vue({
    el: "#app1",
    data:{
        global_count:0
    }
})   