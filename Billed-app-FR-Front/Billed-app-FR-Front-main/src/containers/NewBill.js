import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"
import {localStorageMock} from "../__mocks__/localStorage.js";


export default class NewBill {
  
  constructor({ document, onNavigate, store, localStorage }) {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
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
    const fileInput = this.document.querySelector(`input[data-testid="file"]`);
    const fileErrorMessage = this.document.querySelector('p[data-testid="file-error-message"]');
    const file = fileInput.files[0]

    if (file.type.includes('png') || file.type.includes('jpg') || file.type.includes('jpeg')) {
      fileErrorMessage.classList.add('hide');
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
      })
      .catch(error => console.error(error))
    } else {
      fileInput.value = ''
      fileErrorMessage.classList.remove('hide')
    }
  }

  handleSubmit = e => {
    e.preventDefault()
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
    this.updateBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}