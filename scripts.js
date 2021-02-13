function drawChart() {

    // Create the data table.
    
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Topping');
    data.addColumn('number', 'Slices');
    
    data.addRows([
    ['Entradas', Number(Transaction.incomes()/100)],
    ['Saídas', Math.abs(Number(Transaction.expenses()/100))],
    ['Total', Math.abs(Number(Transaction.total()/100))],
    ]);

    // Set chart options

    let darkMode = localStorage.getItem("dev.finances:dark-mode")

    if(darkMode === 'dark-theme') {
        var options = {
            'title':'Transações',
            'colors': ['#49aa26', 'red', 'green'],
            'width':350,
            'backgroundColor': 'transparent',
            'legendTextStyle': {
                color: '#fff',
                fontName: 'Poppins',
                fontSize: 11,
            },
            'titleTextStyle': {
                color: '#fff',
                fontName: 'Poppins',
                fontSize: 18,
            },
            'height':250,
        };
    }
    else {
        var options = {
        'title':'Transações',
        'colors': ['#49aa26', 'red', 'green'],
        'width':350,
        'backgroundColor': 'transparent',
        'legendTextStyle': {
            color: '#000',
            fontName: 'Poppins',
            fontSize: 11,
        },
        'titleTextStyle': {
            color: '#000',
            fontName: 'Poppins',
            fontSize: 18,
        },
        'height':250,
        };
    }

    if(Transaction.incomes() == 0 && Transaction.expenses() == 0 && Transaction.total() == 0) {
        document.querySelector(".chart_div_help").classList.remove("active")
    }
    else {
        document.querySelector(".chart_div_help").classList.add("active")
    }

    // Instantiate and draw our chart, passing in some options.

    var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
    chart.draw(data, options);
}

// function drawLineChart() {
//   var data = google.visualization.arrayToDataTable([
//     ['Data',        'Entradas',  'Saídas',   'Total'],
//     ['2004',        1000,        400,       100],
//     ['2005',        1170,        460,       500],
//     ['2006',        660,         1120,      1000],
//     ['2007',        1030,        540,       1500]
//   ])
//   var options = {
//     title: 'Histórico de transações',
//     curveType: 'function',
//     legend: { position: 'bottom' }
//   }
//   var chart = new google.visualization.LineChart(document.getElementById('curve_chart'))
//   chart.draw(data, options);
// }

function compare(a, b) {
    if (a.last_nom < b.last_nom){
      return -1;
    }
    if (a.last_nom > b.last_nom){
      return 1;
    }
    return 0;
}

const Modal = {
  open() {
    document.querySelector(".modal-overlay").classList.add("active");
    document.querySelector(".modal").classList.add("active");
  },
  close() {
    document.querySelector(".modal-overlay").classList.remove("active");
    document.querySelector(".modal").classList.remove("active");
  },
}

let expenseGraphicValue = []
let incomeGraphicValue = []
let totalGraphicValue = []

let newDatas = []
let oldDatas = []

// Pegar as transações
// Transformar em números
// Ordenar
// Setar
// Reload

if(localStorage.getItem("dev.finances:expenses") !== null) {
    expenseGraphicValue = localStorage.getItem("dev.finances:expenses")
    expenseGraphicValue = expenseGraphicValue.split(',').map(function(item) {
    return parseInt(item, 10);});
}

if(localStorage.getItem("dev.finances:incomes") !== null) {
    incomeGraphicValue = localStorage.getItem("dev.finances:incomes")
    incomeGraphicValue = incomeGraphicValue.split(',').map(function(item) {
    return parseInt(item, 10);});
}

if(localStorage.getItem("dev.finances:total") !== null) {
    totalGraphicValue = localStorage.getItem("dev.finances:total")
    totalGraphicValue = totalGraphicValue.split(',').map(function(item) {
    return parseInt(item, 10);});
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) ||
        []
    },

    getGraphics() {
        return JSON.parse(localStorage.getItem("dev.finances:graphics")) ||
        []
    },
    
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.
        stringify(transactions))
    },
    setDarkMode() {
        let theme = localStorage.getItem("dev.finances:dark-mode")

        if(theme === 'dark-theme') {
            localStorage.setItem("dev.finances:dark-mode", 'light-theme')
        }
        else {
            localStorage.setItem("dev.finances:dark-mode", 'dark-theme')
        }
    }
}

function dynamicSort(property) {
    var sortOrder = 1;

    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }

    return function (a,b) {
        if(sortOrder == -1){
            return b[property].localeCompare(a[property]);
        }else{
            return a[property].localeCompare(b[property]);
        }        
    }
}


const Transaction = {
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        let transactions = Storage.get()

        if(transactions[index].amount < 0) {
            let removeTransaction = expenseGraphicValue
            Transaction.all.splice(index, 1)
            removeTransaction.pop(removeTransaction.indexOf(index))
    
            localStorage.setItem("dev.finances:expenses", removeTransaction)
        }
        else {
            let removeTransaction = incomeGraphicValue
            Transaction.all.splice(index, 1)
            removeTransaction.pop(removeTransaction.indexOf(index))
    
            localStorage.setItem("dev.finances:incomes", removeTransaction)
        }

        App.reload();
    },

    incomes(){
        let income = 0;
        Transaction.all.forEach(transaction => {
            if( transaction.amount > 0 ) {
                income += transaction.amount;
            }
        })
        return income;
    },
    expenses(){
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if( transaction.amount < 0 ) {
                expense += transaction.amount;
            }
        })
        return expense;
    },
    total(){
        return Transaction.incomes() + Transaction.expenses();
    },
    hideAmount() {
        let total = document.getElementById("totalDisplay")
        let currency = Transaction.total()
        currency = Utils.formatCurrency(currency)
        if(total.innerHTML === 'Saldo oculto') {
            localStorage.setItem("dev.finances:hide", 'visible')
            total.innerHTML = currency
        }
        else {
            localStorage.setItem("dev.finances:hide", 'hide')
            total.innerHTML = "Saldo oculto"
        }
    }
}

const OrderBy = {
    
    orderDescription(){
        oldDatas = []
        if(Transaction.all.length != newDatas.length){
            
            for(item of Transaction.all){
                oldDatas.push(item)
            }
            
            for(item of Transaction.all){
                newDatas.push(item)
            }
            
            newDatas.sort(function(a, b){
                return a.description.toLowerCase().localeCompare(b.description.toLowerCase())
               
            })
            
            if(JSON.stringify(Transaction.all) == JSON.stringify(newDatas)){ 
                newDatas.sort(function(a, b){
                    return b.description.toLowerCase().localeCompare(a.description.toLowerCase())
                }) 
            }
        
        }
    },

    orderAmount(){
        oldDatas = []
        if(Transaction.all.length != newDatas.length){
            for(item of Transaction.all){
                oldDatas.push(item)
            }

            for(item of Transaction.all){
                newDatas.push(item)
            }

            newDatas.sort(function(a, b){
                return parseFloat(b.amount) - parseFloat(a.amount);
            }) 

            if(JSON.stringify(Transaction.all) == JSON.stringify(newDatas)){ 
                newDatas.sort(function(a, b){
                    return parseFloat(a.amount) - parseFloat(b.amount);
                }) 
            }
        }
    },

    orderDate(){
        oldDatas = []
        if(Transaction.all.length != newDatas.length){
            for(item of Transaction.all){
                oldDatas.push(item)
            }

            for(item of Transaction.all){
                newDatas.push(item)
            }

            newDatas.sort(function(a, b){
                var dateA = a.date.split('/').reverse().join(),
                dateB = b.date.split('/').reverse().join();
                return dateA > dateB ? -1 : (dateA > dateB ? 1 : 0);
            }) 

            if(JSON.stringify(Transaction.all) == JSON.stringify(newDatas)){ 
                newDatas.sort(function(a, b){
                    var dateA = a.date.split('/').reverse().join(),
                    dateB = b.date.split('/').reverse().join();
                    return dateA < dateB ? -1 : (dateA > dateB ? 1 : 0);
                }) 
            }
        }
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {

        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
              <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" class="remove-transaction" alt="Remover transação">
            </td>
        `

        return html
    },

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value) {
        value = value * 100
        return Math.round(value)
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    darkMode() {
        Utils.setDarkModeClass("body")
        Utils.setDarkModeClass("header")
        Utils.setDarkModeClass(".card")
        Utils.setDarkModeClass(".card.second-card")
        Utils.setDarkModeClass(".new")
        Utils.setDarkModeClass(".data-table-class")
        Utils.setDarkModeClass("footer")
        Utils.setDarkModeClass(".dark-mode-button")
        Utils.setDarkModeClass(".modal")
        Utils.setDarkModeClass(".github-logo")
        Utils.setDarkModeClass(".chart_div_help")

        // let darkMode = localStorage.getItem("dev.finances:dark-mode")
        // if(darkMode === 'dark-mode') {
        //     document.querySelector(".github-logo").src='./assets/github-logo-light.png'
        // }
        // else {
        //     document.querySelector(".github-logo").src='./assets/github-logo.png'
        // }

        Utils.darkModeStorage()

        drawChart()
    },

    setDarkModeClass(name) {
        document.querySelector(name).classList.toggle("dark-mode")
    },

    getGraphicValue(type) {
        if(type === 'income') {
            return incomeGraphicValue
        }
        else if(type === 'expense') {
            return expenseGraphicValue
        }
        else {
            return totalGraphicValue
        }
        // const graphicValue = localStorage.getItem("dev-finances:graphics")
        // return graphicValue
    },

    showLoadScreen() {
        document.querySelector(".load-screen-overlay").classList.toggle("active")
        document.querySelector(".load-screen-text").classList.toggle("active")
        document.querySelector(".load-screen-logo").classList.toggle("active")
        document.querySelector(".load-screen-spinner").classList.toggle("active")

        document.querySelector(".load-screen-overlay").classList.toggle("unactive")
        document.querySelector(".load-screen-text").classList.toggle("unactive")
        document.querySelector(".load-screen-logo").classList.toggle("unactive")
        document.querySelector(".load-screen-spinner").classList.toggle("unactive")
    },

    darkModeStorage() {
        const theme = document.querySelector(".new").className

        if(theme.indexOf("dark-mode") != -1) {
            localStorage.setItem("dev.finances:dark-mode", 'dark-theme')
        }
        else {
            localStorage.setItem("dev.finances:dark-mode", 'light-theme')
        }
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues() 

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues()

        if(description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "") {
                throw new Error("Por favor, preencha todos os campos")
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            Form.validateFields()
            const transaction = Form.formatValues()
            Transaction.add(transaction)
            Form.amount.value > 0 ? incomeGraphicValue.push(Form.amount.value*100) : expenseGraphicValue.push(Form.amount.value*100)            
            Form.clearFields()
            Modal.close()
            Form.saveGraphicValues()
        } catch(error) {
             alert(error.message)
        }
    },

    saveGraphicValues() {
        localStorage.setItem("dev.finances:incomes", incomeGraphicValue)
        localStorage.setItem("dev.finances:expenses", expenseGraphicValue)
        localStorage.setItem("dev.finances:total", totalGraphicValue)
    }

}

const App = {
    init() {

        Transaction.all.forEach(function(transaction, index){
            DOM.addTransaction(transaction, index)
        })

        DOM.updateBalance()

        Storage.set(Transaction.all)

        if(newDatas.length != 0){
            if (JSON.stringify(Transaction.all) !== JSON.stringify(newDatas)){
                Transaction.all = newDatas
                newDatas = []
            }
            else{
                newDatas = []
            }
        }

        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(drawChart)

        const hide = localStorage.getItem("dev.finances:hide")

        const total = document.getElementById("totalDisplay")

        hide === 'hide' ? total.innerHTML = "Saldo oculto" : total.innerHTML = Utils.formatCurrency(Transaction.total())

        let theme = localStorage.getItem("dev.finances:dark-mode")

        if(theme === 'dark-theme') {
            const checkBox = document.querySelector(".dark-mode-check-box")
            checkBox.checked = true
            Utils.darkMode()
            theme = localStorage.getItem("dev.finances:dark-mode")
            if(theme !== 'dark-theme') {
                Utils.darkMode()
            }
        }

        document.querySelector(".load-screen-overlay").classList.toggle("active")
        document.querySelector(".load-screen-text").classList.toggle("active")
        document.querySelector(".load-screen-logo").classList.toggle("active")
        document.querySelector(".load-screen-spinner").classList.toggle("active")
        setTimeout(Utils.showLoadScreen, 1)
    },

    reload() {
        DOM.clearTransactions()

        App.init()
    },
}

App.init()