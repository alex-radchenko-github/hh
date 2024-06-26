const {chromium} = require('playwright');
const fs = require('fs');
const cookiesPath = 'cookies.json'; // Updated to json for easier parsing in JavaScript
const words_for_search = "Frontend";

const search_url = `https://hh.ru/search/vacancy?st=searchVacancy&text=${words_for_search}&area=113&currency_code=RUR&experience=doesNotMatter&order_by=relevance&search_period=0&items_on_page=10&no_magic=true&L_save_area=true`;
const pages = Array.from({length: 29}, (_, i) => i + 1);


const type_of_work = "vacancy_response"; // "vacancy_response", "covering_letter"

(async () => {
  const browser = await chromium.launch({headless: false});
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('https://hh.ru');
  
  const cookies = JSON.parse(fs.readFileSync(cookiesPath, 'utf8'));
  for (const cookie of cookies) {
    await context.addCookies([cookie]);
  }
  
  await page.waitForTimeout(Math.random() * 2000 + 2000);
  await page.goto("https://hh.ru/applicant/negotiations?state=&filter=active&page=0");
  await page.waitForTimeout(Math.random() * 2000 + 2000);
  
  
  if (type_of_work === "vacancy_response") {
    await page.goto(search_url);
    await page.reload();
    await page.waitForTimeout(Math.random() * 2000 + 2000);
    
    let it = 0;
    let limits = false;
    
    for (const i of pages) {
      if (limits) break;
      
      await page.goto(`${search_url}&page=${i}`);
      await page.waitForTimeout(Math.random() * 2000 + 2000);
      
      const vacancies = await page.$$('//*[@data-qa="vacancy-serp__vacancy_response"]');
      for (const vacancy of vacancies) {
        try {
          await page.waitForTimeout(Math.random() * 2000 + 2000);
          await vacancy.click();
          await page.waitForTimeout(1000);
          
          // Check if the first element is present on the page
          const isFirstElementVisible = await page.evaluate(() => {
            const element = document.querySelector('h1[data-qa="bloko-header-1"]');
            return element !== null;
          });
          
          if (isFirstElementVisible) {
            await page.goBack(); // Go back to the previous page
            await page.waitForTimeout(1000);
            break; // End the loop
          }
          
          // Check if the second element is present on the page
          const isSecondElementVisible = await page.evaluate(() => {
            const element = document.querySelector('span.bloko-modal-title');
            return element !== null;
          });
          
          if (isSecondElementVisible) {
            // Click the close button
            await page.click('button[data-qa="vacancy-response-popup-close-button"]');
            await page.waitForTimeout(1000);
          }
          
          it++;
          console.log(it);
        } catch (e) {
          console.log(e)
          
        }
        
      }
      
      
    }
  }
  
  if (type_of_work === "covering_letter") {
    const text_for_hr = `
      Здравствуйте меня зовут Сергей Иванов.
      И я бы хотел выразить свой интерес к вашей вакансии.
      У меня есть значительный опыт работы с HTML, CSS и JavaScript. Я владею методологией БЭМи умею работать с flex и grid отображением, а также SCSS и CSS-переменными. Я регулярно использую TypeScript и REST API в своих проектах, и имею опыт создания SPA приложений наReact.

      В своем подходе к разработке я всегда стараюсь следовать принципам семантической верстки, чтобы сделать код максимально чистым и понятным, а также эффективным в работе. Мой опыт работы включает создание авторизации в приложениях и переиспользование кода для оптимизации производительности.
      
      Ваше предложение полностью совпадает с моими профессиональными целями и ожиданиями. Я уверен, что мой опыт и знания помогут мне стать ценным членом вашей команды.
      
      Буду рад обсудить возможное сотрудничество на собеседовании.

      C Уважением!
      Сергей Иванов`;
    
    
    for (const i of pages) {
      console.log(i);
      await page.goto(`https://hh.ru/applicant/negotiations?state=&filter=active&page=${i}`);
      await page.waitForTimeout(Math.random() * 2000 + 2000);
      
      const rows = await page.$$('//*[@data-qa="negotiations-item-vacancy"]');
      for (const row of rows) {
        await row.click();
        await page.waitForTimeout(Math.random() * 1000 + 1000);
        
        const pages = await context.pages();
        const newPage = pages[pages.length - 1];
        
        try {
          await newPage.click('//*[@data-qa="negotiations-write"]');
          await newPage.waitForTimeout(Math.random() * 1000 + 1000);
          await newPage.fill('//*[@data-qa="negotiations-new-message"]', text_for_hr);
          await newPage.waitForTimeout(Math.random() * 1000 + 1000);
          await newPage.click('//*[@data-qa="negotiations-save"]');
          await newPage.waitForTimeout(Math.random() * 1000 + 1000);
          await newPage.close();
        } catch (error) {
          await newPage.close();
        }
      }
    }
  }
  
  await browser.close();
})();
