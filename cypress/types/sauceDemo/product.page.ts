import { summarySubtotalLabel } from "../../e2e/sauceDemo/helper/element.extends";

export interface Product {
  name: string;
  price: string;
  desc: string;
}

export class InventoryPage {
  products: Product[];

  constructor(products: Product[]) {
    this.products = products;
  }

  selectInventoryItem(
    eq: number,
    elementInvetoryItemSection: string,
    elementInvetoryItem: string,
    inventoryItemPrice: string,
    inventoryItemDescription: string
  ) {
    cy.get(elementInvetoryItemSection)
      .eq(eq)
      .within(() => {
        const product1: Product = {
          name: "",
          price: "",
          desc: "",
        };

        cy.get(elementInvetoryItem)
          .invoke("text")
          .then((text) => {
            product1.name = text;
          });

        cy.get(inventoryItemPrice)
          .invoke("text")
          .then((text) => {
            product1.price = text;
          });

        cy.get(inventoryItemDescription)
          .invoke("text")
          .then((text) => {
            product1.desc = text;
          });

        cy.contains("button", "Add to cart")
          .click()
          .then(() => {
            this.products.push(product1);
          });
      });
  }

  checkSummaryOfItems(products: Product[]) {
    cy.then(() => {
      const total = products.reduce((sum, p) => {
        return sum + parseFloat(p.price.replace("$", ""));
      }, 0);
      const formattedTotal = `Item total: $${total.toFixed(2)}`;
      cy.get(summarySubtotalLabel).should("have.text", formattedTotal);
    });
  }

  removeItemFromCart(product: Product) {
    const removeButton: string = product.name
      .toLocaleLowerCase()
      .replace(/\s+/g, "-");
    cy.get(`[name="remove-${removeButton}"]`).click();
  }
}
