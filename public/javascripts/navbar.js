
const colorBtn = document.querySelector('#colorbtn')
const htmlElement = document.querySelector('#html')

let colorMode = 'light'
colorBtn.addEventListener('click', evt => {
    console.log()
    if (htmlElement.getAttribute('data-bs-theme') == 'dark') {
        htmlElement.setAttribute('data-bs-theme', 'light')
    } else if (htmlElement.getAttribute('data-bs-theme') == 'light') {
        htmlElement.setAttribute('data-bs-theme', 'dark')
    }
})