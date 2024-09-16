import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"


function validateFiles(files) {
  //extensions et type MIME autorisés
  const allowedExtensions = ['png', 'jpg', 'jpeg']
  const allowedMimeTypes = ['image/png', 'image/jpeg']

  for (let i = 0; i < files.length; i++) {
    const file = files[i]

    const fileExtension = file.name.split('.').pop().toLowerCase();

    // Vérifie l'extension et le type MIME du fichier
    if (!allowedExtensions.includes(fileExtension) || !allowedMimeTypes.includes(file.type)) {
      alert('Seuls les fichiers PNG, JPG, JPEG sont autorisés.');
      return false
    }
  }
  // Si les fichiers sont valides
  return true
}

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }

  handleChangeFile = e => {
    e.preventDefault()
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]

    if(!validateFiles([file])) {
      // réinitialise l'input file si le fichier est invalide
      e.target.value = ''
      // et sort de la fonction si le fichier n'est pas valide
      return
    }

    const filePath = e.target.value.split(/\\/g)
    const fileName = filePath[filePath.length-1]
    const formData = new FormData()
    const email = JSON.parse(localStorage.getItem("user")).email
    formData.append('file', file)
    formData.append('email', email)

    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({fileUrl, key}) => {
        this.billId = key
        this.fileUrl = fileUrl
        this.fileName = fileName
      }).catch(error => console.error(error))
  }

  handleSubmit = e => {
    e.preventDefault()
    console.log("handleSubmit called");

    const user = localStorage.getItem("user");
    console.log("LocalStorage user:", user);

    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    console.log("Bill to be created:", bill);
    this.updateBill(bill)
    console.log("update called");
    this.onNavigate(ROUTES_PATH['Bills'])
  }
 

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      return this.store  // "return" ici pour retourner la promesse
          .bills()
          .update({ data: JSON.stringify(bill), selector: this.billId })
          .then(() => {
            this.onNavigate(ROUTES_PATH['Bills']);
          })
          .catch(error => console.error("Error updating bill:", error));
    }
    // Retourne une promesse rejetée si `this.store` n'est pas défini
    return Promise.reject(new Error('Store is not defined'));
  }
}