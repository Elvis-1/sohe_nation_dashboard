# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: storefront-address-live.spec.ts >> storefront live flow can save an address from account addresses page
- Location: tests/e2e/storefront-address-live.spec.ts:6:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Address added.')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Address added.')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e5]:
        - link "Sohe's Nation icon Sohe's Nation Built Like An Army" [ref=e6] [cursor=pointer]:
          - /url: /
          - img "Sohe's Nation icon" [ref=e8]
          - generic [ref=e9]:
            - paragraph [ref=e10]: Sohe's Nation
            - paragraph [ref=e11]: Built Like An Army
        - navigation [ref=e12]:
          - link "New Drop" [ref=e13] [cursor=pointer]:
            - /url: /
          - link "Men" [ref=e14] [cursor=pointer]:
            - /url: /products?gender=men
          - link "Women" [ref=e15] [cursor=pointer]:
            - /url: /products?gender=women
          - link "Stories" [ref=e16] [cursor=pointer]:
            - /url: /stories
        - generic [ref=e17]:
          - link "Search" [ref=e18] [cursor=pointer]:
            - /url: /products
          - link "Account" [ref=e19] [cursor=pointer]:
            - /url: /account
          - link "Bag0" [ref=e20] [cursor=pointer]:
            - /url: /bag
    - main [ref=e21]:
      - generic [ref=e23]:
        - generic [ref=e24]:
          - generic [ref=e25]:
            - generic [ref=e26]: Address Book
            - heading "Keep delivery details ready for checkout." [level=2] [ref=e27]:
              - text: Keep delivery details
              - generic [ref=e28]: ready for checkout.
          - paragraph [ref=e30]: No saved addresses yet.
        - generic [ref=e31]:
          - paragraph [ref=e32]: Add Address
          - generic [ref=e33]:
            - textbox "Label (Home, Office)" [ref=e34]: Home 516892
            - textbox "Recipient name" [ref=e35]: Customer Person
            - textbox "Phone (optional)" [ref=e36]
            - textbox "Address line 1" [ref=e37]: 12 Admiralty Way 516892
            - textbox "Address line 2 (optional)" [ref=e38]
            - generic [ref=e39]:
              - textbox "City" [ref=e40]: Lagos
              - textbox "State / Province" [ref=e41]: Lagos
            - generic [ref=e42]:
              - combobox [ref=e43]:
                - option "Nigeria" [selected]
                - option "United States"
                - option "United Kingdom"
                - option "European Union"
              - textbox "Postal code" [ref=e44]
            - generic [ref=e45]:
              - checkbox "Make default shipping address" [ref=e46]
              - text: Make default shipping address
            - paragraph [ref=e47]: Failed to fetch
            - generic [ref=e48]:
              - button "Save Address" [ref=e49]
              - link "Back to account" [ref=e50] [cursor=pointer]:
                - /url: /account
    - contentinfo [ref=e51]:
      - generic [ref=e52]:
        - generic [ref=e53]:
          - paragraph [ref=e54]: Stay Close
          - heading "The release moves on. Stay with it." [level=2] [ref=e55]
          - paragraph [ref=e56]: Stay near the next drop, the next frame, and the next shift in the line before it lands everywhere else.
          - generic [ref=e57]:
            - generic [ref=e58]: Sohe's Nation
            - link "support@sohenation.com" [ref=e59] [cursor=pointer]:
              - /url: mailto:support@sohenation.com
          - generic [ref=e60]:
            - paragraph [ref=e61]: End Note
            - paragraph [ref=e62]: Built to be worn hard. Framed to be remembered.
            - paragraph [ref=e63]: "The storefront closes on the same idea it opens with: strong silhouettes, disciplined styling, and a release story that keeps its edge all the way through."
        - generic [ref=e64]:
          - generic [ref=e65]:
            - generic [ref=e66]:
              - paragraph [ref=e67]: Newsletter
              - heading "Stay on drop alert." [level=3] [ref=e68]
            - generic [ref=e69]: Weekly dispatch
          - paragraph [ref=e70]: Release notes, lookbook previews, and first-call access for the next Sohe's Nation drop.
          - generic [ref=e71]:
            - generic [ref=e72]:
              - generic [ref=e73]: Email address
              - textbox "Email address" [ref=e74]
            - button "Join The List" [ref=e75]
          - generic [ref=e76]:
            - paragraph [ref=e77]: No spam. Only release-critical mail.
            - paragraph [ref=e78]: First notice stays with the list.
  - button "Open Next.js Dev Tools" [ref=e84] [cursor=pointer]:
    - img [ref=e85]
  - alert [ref=e88]
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | const STORAGE_KEY = "sohe-storefront-account-session";
  4  | const API_BASE = "http://localhost:8000/api/v1";
  5  | 
  6  | test("storefront live flow can save an address from account addresses page", async ({
  7  |   page,
  8  |   request,
  9  | }) => {
  10 |   const email = `live-address-${Date.now()}@example.com`;
  11 |   const password = "live-pass-123";
  12 |   const register = await request.post(`${API_BASE}/auth/customer/register/`, {
  13 |     data: {
  14 |       email,
  15 |       password,
  16 |       first_name: "Live",
  17 |       last_name: "Address",
  18 |     },
  19 |   });
  20 |   expect(register.ok()).toBeTruthy();
  21 |   const payload = await register.json();
  22 |   await page.addInitScript(
  23 |     ([storageKey, session]) => {
  24 |       window.localStorage.setItem(storageKey, JSON.stringify(session));
  25 |     },
  26 |     [
  27 |       STORAGE_KEY,
  28 |       {
  29 |         isAuthenticated: true,
  30 |         token: payload.token,
  31 |         expiresAt: new Date(payload.expires_at).getTime(),
  32 |         email: payload.user.email,
  33 |         firstName: payload.user.first_name,
  34 |         lastName: payload.user.last_name,
  35 |         emailVerified: payload.user.email_verified,
  36 |       },
  37 |     ],
  38 |   );
  39 | 
  40 |   await page.goto("/account/addresses");
  41 |   await expect(page.getByText("Address Book")).toBeVisible();
  42 | 
  43 |   const suffix = Date.now().toString().slice(-6);
  44 |   await page.getByPlaceholder("Label (Home, Office)").fill(`Home ${suffix}`);
  45 |   await page.getByPlaceholder("Recipient name").fill("Customer Person");
  46 |   await page.getByPlaceholder("Address line 1").fill(`12 Admiralty Way ${suffix}`);
  47 |   await page.getByPlaceholder("City").fill("Lagos");
  48 |   await page.getByPlaceholder("State / Province").fill("Lagos");
  49 |   await page.getByRole("button", { name: "Save Address" }).click();
  50 | 
> 51 |   await expect(page.getByText("Address added.")).toBeVisible();
     |                                                  ^ Error: expect(locator).toBeVisible() failed
  52 |   await expect(page.getByText(`12 Admiralty Way ${suffix}, Lagos, Lagos`)).toBeVisible();
  53 | });
  54 | 
```