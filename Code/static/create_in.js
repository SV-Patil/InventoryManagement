var app = new Vue({
    el: '#app',
    data: function(){
        return{
            input : "",
            suggested: [],
            selected:[],
            show:false,
            quantity:[],
            ex_dates:[],
            sel_dict:{}
        }
    },
    methods:{
        add_to_selected: function(mid){
            console.log("selected")
            this.selected.push(mid);
            this.sel_dict[mid]=[];
            let ele = document.getElementsByName("q"+mid);
            if(ele[0].value == ''){
                this.quantity.push(1);
            }
            else{
                this.quantity.push(ele[0].value);
                this.ex_dates.push(ele[1].value);
                this.sel_dict[mid].push(ele[0].value);
                this.sel_dict[mid].push(ele[1].value);
            }
            this.show=true;
            console.log(this.sel_dict)
        },
        rm_slt: function(value) {
            var index = this.selected.indexOf(value);
            if (index > -1) {
              this.selected.splice(index, 1);
              this.quantity.splice(index, 1);
            }
            
        },
        create_new_inven: function(){
            const date_var = document.getElementById("example").value;
            const data = {
                selected_med_list : this.selected,
                selected_quantity_list : this.quantity,
                selected_ex_list : this.ex_dates,
                date : date_var
            };
            fetch('/create_in',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                alert("Inventory added successfully");
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        },
        cal_med: function(){
            if(this.input==""){
                this.suggested=[];
            }
            else{
                fetch("/search_for_del/"+this.input)
                .then(response => response.json()
                .then(result => this.suggested=result["Medicine name"]))
                .catch(err => console.log(err))
            }
        } 
    },
    delimiters: ['[[',']]']
})