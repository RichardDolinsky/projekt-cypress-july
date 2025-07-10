export class ILoginPage implements loginIntoPage {
  username: string;
  password: string;
  loginElementSelector: string;
  loginButtonSelecter: string;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
    this.loginElementSelector = '[id="login_button_container"]';
    this.loginButtonSelecter = '[name="login-button"]';
  }

  visitLoginPage(): void {
    cy.visit("https://www.saucedemo.com/");
    cy.get('[class="login_logo"]', { timeout: 10000 }).should("be.visible");
  }

  performLogin(): void {
    cy.get(this.loginElementSelector).within(() => {
      cy.get('input[name="user-name"]').type(this.username);
      cy.get('input[name="password"]').type(this.password);
      cy.get(this.loginButtonSelecter).click();
    });
  }

  getUserNames(): Cypress.Chainable<string[]> {
    return cy.get(".login_credentials").then(($el) => {
      // $el je jQuery element
      const rawHtml = $el.html() || "";
      // Rozdelíme podľa <br> tagov
      const parts = rawHtml
        .split("<br>")
        .map((part) => part.trim())
        .filter((part) => part.length > 0);
      // Prvý element môže byť nadpis, odstránime ho, ak tam je
      const filtered = parts.filter(
        (text) => !text.toLowerCase().includes("accepted usernames")
      );
      return cy.wrap(filtered);
    });
  }

  logOutFromApp(): void {
    cy.document().then((doc) => {
      const header = doc.querySelector('[class="bm-burger-button"]');
      cy.wrap(header).should("be.visible");
      cy.wrap(header).click();

      cy.get('[data-test="logout-sidebar-link"]').click();
    });
  }

  clickJquery(selector: string): void {
    cy.document().then((doc) => {
      const cart = doc.querySelector(selector);
      cy.wrap(cart).should("be.visible");
      cy.wrap(cart).click();
    });
  }
}
