import { ROUTES_PATH } from '../constants/routes.js';


export let PREVIOUS_LOCATION = '';

export default class Login {
  constructor({ document, localStorage, onNavigate, PREVIOUS_LOCATION, store }) {
    this.document = document;
    this.localStorage = localStorage;
    this.onNavigate = onNavigate;
    this.PREVIOUS_LOCATION = PREVIOUS_LOCATION;
    this.store = store;

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    const formEmployee = this.document.querySelector(`form[data-testid="form-employee"]`);
    const formAdmin = this.document.querySelector(`form[data-testid="form-admin"]`);

    if (formEmployee) formEmployee.addEventListener("submit", (e) => this.handleSubmit(e, 'Employee'));
    if (formAdmin) formAdmin.addEventListener("submit", (e) => this.handleSubmit(e, 'Admin'));
  }

  handleSubmit = async (e, userType) => {
    e.preventDefault();
    const emailInputSelector = userType === 'Employee' ? 'employee-email-input' : 'admin-email-input';
    const passwordInputSelector = userType === 'Employee' ? 'employee-password-input' : 'admin-password-input';

    const user = {
      type: userType,
      email: e.target.querySelector(`input[data-testid="${emailInputSelector}"]`).value,
      password: e.target.querySelector(`input[data-testid="${passwordInputSelector}"]`).value,
      status: "connected"
    };

    this.localStorage.setItem("user", JSON.stringify(user));

    try {
      await this.login(user);
      this.onSuccessfulLogin(userType);
    } catch (err) {
      try {
        await this.createUser(user);
        this.onSuccessfulLogin(userType);
      } catch (createErr) {
         console.error('Error creating user:', createErr);
         //Add user-friendly error handling here;
      }
    }
  }

  onSuccessfulLogin(userType) {
    const route = userType === 'Employee' ? ROUTES_PATH['Bills'] : ROUTES_PATH['Dashboard'];
    this.onNavigate(route);
    this.PREVIOUS_LOCATION = route;
    PREVIOUS_LOCATION = this.PREVIOUS_LOCATION;
    this.document.body.style.backgroundColor = "#fff";
  }

  login = (user) => {
    if (this.store) {
      return this.store.login(JSON.stringify({
        email: user.email,
        password: user.password,
      })).then(({ jwt }) => {
        this.localStorage.setItem('jwt', jwt);
      });
    } else {
      return Promise.reject(new Error('No store available'));
    }
  }

  createUser = (user) => {
    if (this.store) {
      return this.store.users().create({
        data: JSON.stringify({
          type: user.type,
          email: user.email,
          password: user.password,
        })
      }).then(() => {
        return this.login(user);
      });
    } else {
      return Promise.reject(new Error('No store available'));
    }
  }
}
