/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import '@testing-library/jest-dom/extend-expect' // for additional matchers like toBeInTheDocument
import NewBillUI from "../views/NewBillUI.js"
import { ROUTES_PATH } from "../constants/routes";
import router from "../app/Router.js";
import {localStorageMock} from "../__mocks__/localStorage.js";


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the form should be rendered correctly", () => {
      // Render the NewBill UI
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      const html = NewBillUI()
      document.body.innerHTML = html

      // Check if the form is rendered
      const form = screen.getByTestId('form-new-bill')
      expect(form).toBeInTheDocument()

      // Check if the submit button is present
      const submitButton = screen.getByRole('button', { name: /envoyer/i })
      expect(submitButton).toBeInTheDocument()

      // Check if all form fields are present
      const expenseTypeField = screen.getByTestId('expense-type')
      const expenseNameField = screen.getByTestId('expense-name')
      const datePickerField = screen.getByTestId('datepicker')
      const amountField = screen.getByTestId('amount')
      const vatField = screen.getByTestId('vat')
      const pctField = screen.getByTestId('pct')
      const commentaryField = screen.getByTestId('commentary')
      const fileField = screen.getByTestId('file')

      expect(expenseTypeField).toBeInTheDocument()
      expect(expenseNameField).toBeInTheDocument()
      expect(datePickerField).toBeInTheDocument()
      expect(amountField).toBeInTheDocument()
      expect(vatField).toBeInTheDocument()
      expect(pctField).toBeInTheDocument()
      expect(commentaryField).toBeInTheDocument()
      expect(fileField).toBeInTheDocument()
    })
  })
})