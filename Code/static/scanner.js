Vue.component('scanner',{
    template:`
    <div>
    <span style="height: 50px;margin-left:50%;" v-on:click="startscan"><i class="bi bi-camera h1"></i></span>
    <div  v-show="show_scan" id="scan_cont">
        <div id="reader" style="width: 300px;margin-left: 30%;"></div>
        <span style="height: 50px;margin-left:50%;" v-on:click="stopscan"><i class="bi bi-x h1"></i></span>
    </div>
    <div id="result"></div>
    </div>
    `,
    data: function(){
        return{
            show_scan: false,
            html5QrCode: null,
        }
    },
    methods:{
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

        onScanSuccess: function(decodedText, decodedResult) {
            document.getElementById('result').innerText = `Scanned code: ${decodedText}`;
            console.log(decodedResult)
            this.stopScan();
            this.fetchMedicineInfo(decodedText);
        },
            
        onScanFailure: function(error) {
            console.warn(`Code scan error = ${error}`);
        },

        startscan: function(){
            if (!this.html5QrCode) {
                this.html5QrCode = new Html5Qrcode("reader");
            }
            this.html5QrCode.start({ facingMode: "environment" }, {
                fps: 10,
                qrbox: { width: 150, height: 150 }
            }, this.onScanSuccess, this.onScanFailure)
            .catch(err => {
                console.error(`Unable to start scanning, error: ${err}`);
            });

            this.show_scan=true;
        },
        stopscan: function(){
            if (this.html5QrCode) {
                this.html5QrCode.stop().then(() => {
                  // Hide scanner container
                  this.show_scan=false;
                }).catch(err => {
                  console.error(`Unable to stop scanning: ${err}`);
                });
            }
        }
    }
})




var app = new Vue({
    el: "#app"
}) 