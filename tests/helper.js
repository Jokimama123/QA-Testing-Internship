import { expect } from '@playwright/test';

// Function to handle the login process
export async function login(page, username, password) {
  // Click on the login button to open the Log in Modal
  await page.click('#login2');
  // Wait for the login modal to become visible
  await page.waitForSelector('#logInModal', { state: 'visible' });
  // Fill in the username field with the provided username
  await page.fill("#loginusername", username);
  // Fill in the password field with the provided password
  await page.fill("#loginpassword", password);
  // Focus on the login button (helps ensure it is ready for interaction)
  await page.locator('button.btn.btn-primary:has-text("Log in")').focus();
  // Press the 'Enter' key to submit the login form
  await page.locator('button.btn.btn-primary:has-text("Log in")').click()
}

// Function to check if the user is logged in by verifying the welcome message with the username
export async function userLoggedInCheck(page, username) {
  // Wait for 1 second to ensure that any page load or UI updates are complete
  await page.waitForTimeout(1000)
  // Assert that the element with the ID 'nameofuser' contains the correct welcome message with the username
  // This ensures that the user is successfully logged in and the welcome message displays the correct username
  await expect(page.locator('a#nameofuser')).toHaveText(`Welcome ${username}`)
}

// Function to handle the sign-up process
export async function signUp(page, username, password) {
  // Click on the sign-up button (usually opens a sign-up modal or page)
  await page.click('#signin2');
  // Wait for the sign in modal to become visible
  await page.waitForSelector('#signInModal', { state: 'visible' });
  // Fill in the sign-up username field with the provided username
  await page.fill("#sign-username", username);
  // Fill in the sign-up password field with the provided password
  await page.fill("#sign-password", password);
  // Focus on the sign-up button (helps ensure it is ready for interaction)
  await page.locator('button.btn.btn-primary:has-text("Sign up")').focus();
  // Press the 'Enter' key to submit the sign-up form
  await page.locator('button.btn.btn-primary:has-text("Sign up")').press('Enter');
}

// This function will iterate through an array of item names and add each item to the cart
export async function addItemsToCart(page, itemNames) {
  // Loop through the list of item names
  for (const itemName of itemNames) {
    let itemFound = false;
    await page.waitForTimeout(1000); // Wait for the page to load

    // Loop until the current item is found
    while (!itemFound) {
      const item = page.getByText(itemName, { exact: true });
      const isItemVisible = await item.isVisible();

      if (isItemVisible) {
        // If the item is found, click on it and add it to the cart
        await item.click();
        await page.locator('a.btn.btn-success.btn-lg').click();
        await page.waitForTimeout(1000)
        await page.locator("li", { hasText: "Home" }).click();
        itemFound = true; // Item is added to the cart, move to the next item
      } else {
        // If the item is not found on the current page, go to the next page
        const nextButton = page.locator('button#next2.page-link');
        const isNextButtonVisible = await nextButton.isVisible();

        if (isNextButtonVisible) {
          await nextButton.click(); // Click the "Next" button to go to the next page
          await page.waitForTimeout(1000); // Wait for the page to load
        } else {
          // If no more pages are available and the item is not found, throw an error
          throw new Error(`${itemName} not found after checking all pages.`);
        }
      }
    }

    // Optionally, you can wait after adding each item (or remove this if not needed)
    await page.waitForTimeout(1000);
  }
}

// Function to delete a single item from the shopping cart
export async function deleteItemFromCart(page, itemName) {
  // Click on the "Cart" button to open the cart page
  await page.click('#cartur')
  // Locate the product row that contains the item name in the cart
  const productRow = page.locator(`tr:has(td:has-text("${itemName}"))`)
  // Assert that the product name in the second column matches the expected item name
  await expect(productRow.locator('td:nth-child(2)')).toHaveText(itemName)
  // Locate the "Delete" button in the fourth column of the product row
  const deleteButton = productRow.locator('td:nth-child(4) a', { hasText: 'Delete' })
  // Click on the "Delete" button to remove the item from the cart
  await deleteButton.click()
  // Wait for a short period (1 second) to ensure the item is deleted before continuing
  await page.waitForTimeout(1000)
  // Assert that the product row is no longer present in the cart 
  await expect(productRow).toHaveCount(0);
}

export async function deleteMultipleItemsFromCart(page, itemNames) {
  // Navigate to the cart page
  await page.click('#cartur')
  // Wait for the cart table to load
  await page.waitForTimeout(1000);
  for (const itemName of itemNames) {
    // Locate the product row that contains the specific item name
    const productRow = page.locator(`tr:has(td:has-text("${itemName}"))`);
    // Ensure the product is in the cart (verify the item's name in the row)
    await expect(productRow.locator('td:nth-child(2)')).toHaveText(itemName);
    // Locate the "Delete" button in the same row (assumed to be in the 4th column)
    const deleteButton = productRow.locator('td:nth-child(4) a', { hasText: 'Delete' });
    // Click the delete button to remove the item from the cart
    await deleteButton.click();
    // Wait for the deletion to process (wait for item removal from the cart)
    await page.waitForTimeout(1000);
    // Assert that the product row is no longer present in the cart 
    await expect(productRow).toHaveCount(0);
  }
}

// Function to calculate and verify the total value of items in the cart
export async function getTotalValueOfItems(page) {
   // Locate all rows in the table (assuming each item is in a row)
  const rows = page.locator('tr');  
 // Extract the text content of the prices from the third column of each row
  const prices = await rows.locator('td:nth-child(3)').allTextContents(); 
  // Initialize a variable to accumulate the total price
  let total = 0;
  // Loop over each extracted price
  for (const price of prices) {
    // Clean up the price string by removing any non-numeric characters
    const itemValue = parseFloat(price.replace(/[^0-9.-]+/g, ''));
    // Add all prices toghether
    total += itemValue;
  }
  // After summing all item prices, extract the displayed total from the page
  const displayedTotalText = await page.locator('h3#totalp.panel-title').textContent();
  // Clean and parse the displayed total
  const displayedTotal = parseFloat(displayedTotalText.replace(/[^0-9.-]+/g, ''));
  // Assert that the calculated total matches the displayed total on the page
  await expect(displayedTotal).toBe(total);  
  // Return the calculated total value
  return total;
}

// Function to fill out and submit the purchase form
export async function fillAndSubmitPurchaseForm(page, name, country, city, card, month, year) {
  // Click on the button to open the purchase form
  await page.locator('button.btn.btn-success').click();
  // Wait and verify that the "Place order" heading is visible, confirming that the form is open
  await expect(page.locator('h5', {hasText: "Place order"})).toHaveText("Place order")
  // Fill in the purchase form fields with the provided data
  await page.fill("#name", name);
  await page.fill("#country", country);
  await page.fill("#city", city);
  await page.fill("#card", card);
  await page.fill("#month", month);
  await page.fill("#year", year);
  // Click on the "Purchase" button to submit the form
  await page.getByRole('button', { name: 'Purchase' }).click();
}

// Function to check if the shopping cart is empty
export async function checkCartIsEmpty(page) {
  // Click on the "Cart" button to open the cart page
  await page.locator("li", { hasText: "Cart" }).click();
  // Wait for the cart page to load
  await page.waitForTimeout(1000);
  // Locate the table that holds the cart items
  const table = page.locator("#tbodyid");
  // Count the number of rows in the cart table (each row represents an item)
  const rows = await table.locator("tr").count();
  // Assert that the number of rows in the cart is 0 (cart is empty)
  expect(rows).toBe(0);
}

// Function to verify that a successful purchase message appears after completing the purchase
export async function successPurchase(page) {
  // Assert that the second <h2> element on the page contains the expected success message
  // This verifies that the "Thank you for your purchase!" message appears after the purchase
  await expect(page.locator('h2').nth(2)).toHaveText("Thank you for your purchase!")
  // Wait for 0.5 second to ensure that the success message is visible and the page is ready for further actions
  await page.waitForTimeout(500)
  // Click on the 'OK' button to close the success message and proceed (typically closes the modal or notification)
  await page.getByRole('button', {name: 'OK'}).click()
}

// Function to check if an error message appears and verify its content
export async function checkErrorMessage(page, expectedMessage) {
  // Listen for a dialog on the page
  page.on('dialog', async dialog => {
    // Retrieve the message from the dialog
    const message = dialog.message();
    // Assert that the message contains the expected error message
    expect(message).toContain(expectedMessage);
    // Accept the dialog (e.g., click "OK" on an alert)
    await dialog.accept();
    });
}

// Function to fill out and submit the contact message form
export async function fillAndSubmitContactMessageForm(page, email, name, message){
  // Click on the "Contact" button to open the contact form page
  await page.locator("li", { hasText: "Contact" }).click();
  // Wait for the sign in modal to become visible
  await page.waitForSelector('#exampleModal', { state: 'visible' });
  // Wait and verify that the "New message" heading is visible, confirming that the form is open
  await expect(page.locator('h5', {hasText: "New Message"})).toHaveText("New message")
  // Fill in the contact message form fields with the provided data
  await page.fill("#recipient-email", email);
  await page.fill("#recipient-name", name);
  await page.fill("#message-text", message);
  // Click on the "Send Message" button to submit the contact message
  await page.getByRole('button', { name: 'Send Message' }).click();
}

// Function to test if the category filter works correctly by matching items
export async function testCategoryItemsFilter(page, categoryName, expectedItems) {
    // Assert that the "CATEGORIES" text is visible (confirming the category filter is present)
    await expect(page.locator("a", { hasText: "CATEGORIES" })).toHaveText("CATEGORIES")
    // Locate the link to the specific category by its name and click it
    const categoryLink = page.locator("a", { hasText: categoryName });
    await categoryLink.click();
    // Wait for the category items to load
    await page.waitForTimeout(1500);
    // Locate all the items in the category (assumed to be in elements with the "card-title" class)
    const items = await page.locator(".card-title"); 
    // Extract the text content of each item
    const extractedItems  = await items.evaluateAll((elements) => elements.map((el) => el.textContent?.trim()));
    // Log the extracted items (for debugging purposes)
    console.log(extractedItems); 
    // Assert that each extracted item is found in the list of expected items
    for (const item of extractedItems) {
      console.log(item);  // Log each item name for reference
      expect(expectedItems).toContain(item); // Verify that the item is in the expected list
    }
}




