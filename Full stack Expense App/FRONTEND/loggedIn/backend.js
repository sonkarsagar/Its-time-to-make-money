
const amount=document.getElementById('expense')
const description=document.getElementById('description')
const category=document.getElementById('category')
const list=document.getElementById('list')
const submit=document.getElementById('submit')
const premium=document.getElementById('premium')
const logOut=document.getElementById('logOut')

logOut.addEventListener('click',()=>{
    location.replace('http://127.0.0.1:5500/logIn/login.html')
    localStorage.removeItem("token")
})

premium.addEventListener('click',(e)=>{
    e.preventDefault()
    axios.get('http://127.0.0.1:3000/expense/premium', {headers: {'Authorization': localStorage.getItem('token')}}).then((response) => {
        let options={
            "key": response.data.key_id,
            "order_id": response.data.order.id,
            "handler": function (response){
                axios.post('http://127.0.0.1:3000/expense/successTransaction', {
                    order_id: options.order_id,
                    payment_id: response.razorpay_payment_id
                }, {headers: {'Authorization': localStorage.getItem('token')}})
                alert('You are a Premium User')
            }        
        }
        const rzp1=new Razorpay(options)
        rzp1.open()
        e.preventDefault()

        rzp1.on('payment.failed', function (response){
            axios.post('http://127.0.0.1:3000/expense/failTransaction', {
                order_id: options.order_id,
            }, {headers: {'Authorization': localStorage.getItem('token')}})
            alert('Something went wrong')
        } )
    }).catch((err) => {
        console.log(err);
    })
})  

submit.addEventListener('click',(e)=>{
    e.preventDefault()
    axios.post('http://127.0.0.1:3000/expense',{
        amount: amount.value,
        description: description.value,
        category: category.value
    }, {headers: {'Authorization': localStorage.getItem('token')}}).then((res) => {
        const expense=document.createElement('li')
        expense.setAttribute('id',res.data.id)
        expense.appendChild(document.createTextNode(res.data.amount+' Rs - '+res.data.description+' - '+res.data.category+'  '))
        
        const dbutton=document.createElement('button')
        dbutton.setAttribute('class','btn btn-danger btn-sm')
        dbutton.setAttribute('type','button')
        dbutton.appendChild(document.createTextNode('Delete'))
        
        const ebutton=document.createElement('button')
        ebutton.setAttribute('class','btn btn-warning btn-sm')
        ebutton.setAttribute('type','button')
        ebutton.appendChild(document.createTextNode('Edit'))
        
        expense.appendChild(dbutton)
        expense.appendChild(ebutton)

        list.appendChild(expense)        
    }).catch((err) => {
        console.log(err);
    });  
})

list.addEventListener('click',(e)=>{
    e.preventDefault()
    if(e.target.classList.contains('btn-danger')){
        list.removeChild(e.target.parentElement)

        axios.delete(`http://127.0.0.1:3000/expense/${e.target.parentElement.id}`).then((res) => {
            // console.log(res);
        }).catch((err) => {
            console.log(err);
        });
    }

})

window.addEventListener('DOMContentLoaded',()=>{
    axios.get('http://127.0.0.1:3000/expense', {headers: {'Authorization': localStorage.getItem('token')}}).then((res) => {
        res.data.forEach(element => {
            const expense=document.createElement('li')
            expense.setAttribute('id',element.id)
            expense.appendChild(document.createTextNode(element.amount+' Rs - '+element.description+' - '+element.category+'  '))
            
            const dbutton=document.createElement('button')
            dbutton.setAttribute('class','btn btn-danger btn-sm')
            dbutton.setAttribute('type','button')
            dbutton.appendChild(document.createTextNode('Delete'))
            
            const ebutton=document.createElement('button')
            ebutton.setAttribute('class','btn btn-warning btn-sm')
            ebutton.setAttribute('type','button')
            ebutton.appendChild(document.createTextNode('Edit'))
            
            expense.appendChild(dbutton)
            expense.appendChild(ebutton)

            list.appendChild(expense)
        });
    }).catch((err) => {
        console.log(err);
    });
})