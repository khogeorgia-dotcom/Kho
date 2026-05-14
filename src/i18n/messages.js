export const LANGS = ['ru', 'en', 'ka']
export const LOCALE_BY_LANG = { ru: 'ru-RU', en: 'en-US', ka: 'ka-GE' }

export const TYPE_VALUES = ['Все', 'Земельный участок', 'Дом', 'Квартира / студия', 'Коммерческая']
export const DISTRICT_VALUES = ['Все', 'Батумский', 'Шуахевский', 'Кедский', 'Кобулетский', 'Хелвачаурский', 'Хулойский']
export const LAND_STATUS_VALUES = ['Все', 'Сельхоз', 'Не сельхоз']

export const I18N = {
  ru: {
    nav: { buy: 'КУПИТЬ', sell: 'ПРОДАТЬ', about: 'О НАС' },
    heroTitle: 'ПОКУПКА И ПРОДАЖА НЕДВИЖИМОСТИ НА АДЖАРСКОМ ПОБЕРЕЖЬЕ\nГРУЗИЯ, БАТУМИ',
    filters: { type: 'Тип недвижимости', district: 'Район', status: 'Статус', sort: 'Сортировка по цене', asc: 'По возрастанию', desc: 'По убыванию' },
    about: {
      title: 'О нас',
      p1: 'Главный приоритет нашего дела - благополучие человека.',
      p2: 'Создаем понятные и удобные возможности реализации Ваших целей по приобретению или продаже недвижимости на Аджарском побережье.',
      p3: 'Объявления о собственных объектах или объектах эксклюзивной продажи отмечены цветным логотипом сайта.',
      p4: 'Открыты к партнерским отношениям, с благодарностью - к отзывам, с любовью - к Аджарскому побережью.',
      p5: 'Лучшие пожелания, Елена Попова',
    },
    sell: { title: 'Подайте заявку на продажу', text: 'Опишите ваш объект и мы разместим его на нашем сайте с указанием ваших контактных данных.', cta: 'Подать заявку' },
    contactForm: {
      title: 'Связаться с нами',
      name: 'Ваше имя',
      phone: 'Телефон',
      social: 'Соцсеть / мессенджер',
      submit: 'Подать заявку',
      success: 'Спасибо! Заявка отправлена.',
      close: 'Закрыть',
    },
    property: {
      notFound: 'Объект не найден', showPhone: 'Показать номер', areaPlot: 'Площадь участка', statusPlot: 'Статус участка', pricePerPlot: 'Цена за сотку',
      houseArea: 'Площадь дома', floors: 'Количество этажей', finish: 'Вид отделки', seaDistance: 'Расстояние до моря', district: 'Район',
    },
    common: { all: 'Все', cityPrefix: 'г.' },
    optionLabels: {
      'Все': 'Все', 'Земельный участок': 'Земельный участок', 'Дом': 'Дом', 'Квартира / студия': 'Квартира / студия', 'Коммерческая': 'Коммерческая',
      'Сельхоз': 'Сельхоз', 'Не сельхоз': 'Не сельхоз', 'Батумский': 'Батумский', 'Шуахевский': 'Шуахевский', 'Кедский': 'Кедский', 'Кобулетский': 'Кобулетский', 'Хелвачаурский': 'Хелвачаурский', 'Хулойский': 'Хулойский',
    },
  },
  en: {
    nav: { buy: 'BUY', sell: 'SELL', about: 'ABOUT' },
    heroTitle: 'BUYING AND SELLING REAL ESTATE\nADJARA COAST, GEORGIA, BATUMI',
    filters: { type: 'Property type', district: 'District', status: 'Land status', sort: 'Sort by price', asc: 'Low to high', desc: 'High to low' },
    about: {
      title: 'About us', p1: 'The main priority of our work is people well-being.',
      p2: 'We create clear and convenient ways to achieve your goals when buying or selling property on the Adjara coast.',
      p3: 'Listings for own properties or exclusive sales are marked with the colored site logo.',
      p4: 'We are open to partnerships, grateful for feedback, and in love with the Adjara coast.', p5: 'Best regards, Elena Popova',
    },
    sell: { title: 'Submit a listing request', text: 'Describe your property and we will publish it on our website with your contact details.', cta: 'Submit request' },
    contactForm: {
      title: 'Contact us',
      name: 'Your name',
      phone: 'Phone',
      social: 'Social / messenger',
      submit: 'Send request',
      success: 'Thank you! Request sent.',
      close: 'Close',
    },
    property: {
      notFound: 'Property not found', showPhone: 'Show phone number', areaPlot: 'Plot area', statusPlot: 'Land status', pricePerPlot: 'Price per sotka',
      houseArea: 'House area', floors: 'Floors', finish: 'Finishing', seaDistance: 'Distance to sea', district: 'District',
    },
    common: { all: 'All', cityPrefix: 'city' },
    optionLabels: {
      'Все': 'All', 'Земельный участок': 'Land plot', 'Дом': 'House', 'Квартира / студия': 'Apartment / studio', 'Коммерческая': 'Commercial',
      'Сельхоз': 'Agricultural', 'Не сельхоз': 'Non-agricultural', 'Батумский': 'Batumi', 'Шуахевский': 'Shuakhevi', 'Кедский': 'Keda', 'Кобулетский': 'Kobuleti', 'Хелвачаурский': 'Khelvachauri', 'Хулойский': 'Khulo',
    },
  },
  ka: {
    nav: { buy: 'ყიდვა', sell: 'გაყიდვა', about: 'ჩვენ შესახებ' },
    heroTitle: 'უძრავი ქონების ყიდვა და გაყიდვა\nაჭარის სანაპირო, საქართველო, ბათუმი',
    filters: { type: 'ქონების ტიპი', district: 'რაიონი', status: 'მიწის სტატუსი', sort: 'ფასით დალაგება', asc: 'ზრდადობით', desc: 'კლებადობით' },
    about: {
      title: 'ჩვენ შესახებ', p1: 'ჩვენი საქმიანობის მთავარი პრიორიტეტია ადამიანის კეთილდღეობა.',
      p2: 'ვქმნით გასაგებ და მოსახერხებელ გზებს თქვენი მიზნების მისაღწევად აჭარის სანაპიროზე უძრავი ქონების ყიდვა-გაყიდვისას.',
      p3: 'საკუთარი ან ექსკლუზიური ობიექტების განცხადებები მონიშნულია საიტის ფერადი ლოგოთი.',
      p4: 'გახსნილები ვართ პარტნიორობისთვის, მადლიერნი ვართ უკუკავშირისთვის და გვიყვარს აჭარის სანაპირო.', p5: 'საუკეთესო სურვილებით, ელენა პოპოვა',
    },
    sell: { title: 'გაგზავნეთ განაცხადი გაყიდვაზე', text: 'აღწერეთ თქვენი ობიექტი და ჩვენ მას განვათავსებთ საიტზე თქვენი საკონტაქტო მონაცემებით.', cta: 'განაცხადის გაგზავნა' },
    contactForm: {
      title: 'დაგვიკავშირდით',
      name: 'თქვენი სახელი',
      phone: 'ტელეფონი',
      social: 'სოცქსელი / მესენჯერი',
      submit: 'განაცხადის გაგზავნა',
      success: 'გმადლობთ! განაცხადი გაგზავნილია.',
      close: 'დახურვა',
    },
    property: {
      notFound: 'ობიექტი ვერ მოიძებნა', showPhone: 'ნომრის ჩვენება', areaPlot: 'მიწის ფართობი', statusPlot: 'მიწის სტატუსი', pricePerPlot: 'ფასი სოტკაზე',
      houseArea: 'სახლის ფართობი', floors: 'სართულები', finish: 'მოწყობის ტიპი', seaDistance: 'ზღვამდე მანძილი', district: 'რაიონი',
    },
    common: { all: 'ყველა', cityPrefix: 'ქ.' },
    optionLabels: {
      'Все': 'ყველა', 'Земельный участок': 'მიწის ნაკვეთი', 'Дом': 'სახლი', 'Квартира / студия': 'ბინა / სტუდია', 'Коммерческая': 'კომერციული',
      'Сельхоз': 'სასოფლო', 'Не сельхоз': 'არასასოფლო', 'Батумский': 'ბათუმი', 'Шуахевский': 'შუახევი', 'Кедский': 'ქედა', 'Кобулетский': 'ქობულეთი', 'Хелвачаурский': 'ხელვაჩაური', 'Хулойский': 'ხულო',
    },
  },
}

export const getText = (lang) => I18N[lang] || I18N.ru
export const localizeValue = (lang, value) => getText(lang).optionLabels[value] || value

export const getInitialLang = () => {
  const saved = localStorage.getItem('kho_lang')
  if (saved && LANGS.includes(saved)) return saved
  return 'ru'
}

export const nextLang = (lang) => {
  const i = LANGS.indexOf(lang)
  return LANGS[(i + 1) % LANGS.length]
}
