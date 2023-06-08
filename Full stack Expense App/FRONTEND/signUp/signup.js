
const name=document.getElementById('name')
const sur=document.getElementById('sur')
const email=document.getElementById('email')
const password=document.getElementById('password')
const form=document.getElementById('form')
const submit=document.getElementById('submit')

submit.addEventListener('click',(e)=>{
    e.preventDefault()
    axios.post('http://127.0.0.1:3000/user',{
        name: name.value,
        sur: sur.value,
        email: email.value,
        password: password.value
    }).then((result) => {
        alert('Successfully Signed Up')
        location.replace('http://127.0.0.1:5500/logIn/login.html')
    }).catch((err) => {
        const error=document.createElement('p')
        error.appendChild(document.createTextNode('USER ALREADY EXISTS'))
        form.append(error)
    });
})