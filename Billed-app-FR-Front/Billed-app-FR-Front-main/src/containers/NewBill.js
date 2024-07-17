
import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

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
    // existing code...
    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({ fileUrl, key }) => {
        this.billId = key
        this.fileUrl = fileUrl
        this.fileName = fileName
      }).catch(error => {
        console.error(error)
        alert('An error occurred while uploading the file. Please try again.')
      })
  }
  
  handleSubmit = e => {
    // existing code...
    this.updateBill(bill)
      .then(() => this.onNavigate(ROUTES_PATH['Bills']))
      .catch(error => {
        console.error(error)
        alert('An error occurred while submitting the form. Please try again.')
      })
  }
  

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      return this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => this.onNavigate(ROUTES_PATH['Bills']))
        .catch(error => console.error(error))
    }
  }
}