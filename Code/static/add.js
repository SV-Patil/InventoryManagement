const startScannerButton = document.getElementById('start-icon');
    const stopScannerButton = document.getElementById('stop-icon');
    const scannerContainer = document.getElementById('scan-cont');
    const resultContainer = document.getElementById('result');

function onScanSuccess(decodedText, decodedResult) {
    resultContainer.innerText = `Scanned code: ${decodedText}`;
    console.log(decodedResult)
    stopScan();
    fetchMedicineInfo(decodedText);
}
    
function onScanFailure(error) {
    console.warn(`Code scan error = ${error}`);
}

function startScanner() {
    if (!html5QrCode) {
      html5QrCode = new Html5Qrcode("reader");
    }

    html5QrCode.start({ facingMode: "environment" }, {
        fps: 10,
        qrbox: { width: 250, height: 250 }
    }, onScanSuccess, onScanFailure)
    .catch(err => {
        console.error(`Unable to start scanning, error: ${err}`);
    });
    scannerContainer.style.display = 'block';
}  

function stopScan() {
    if (html5QrCode) {
      html5QrCode.stop().then(() => {
        // Hide scanner container
        scannerContainer.style.display = 'none';
      }).catch(err => {
        console.error(`Unable to stop scanning: ${err}`);
      });
    }
  }

startScannerButton.addEventListener('click', startScanner);
stopScannerButton.addEventListener('click', stopScan);

function fetchMedicineInfo(code) {
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
}