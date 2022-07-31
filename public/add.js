//const { judete } = require('judete.js');
//import { judete } from 'judete.js';
//import { judete } from './judete.js'

const selectJudet = document.querySelector('#judet')
const localitate = document.querySelector('#localitate')
const locSelect = document.querySelector('#locSelect')

selectJudet.addEventListener('change', function listen() {
    console.log(selectJudet.value);
    localitate.disabled = false;
    selectJudet.removeEventListener('change', listen);
    for (judet of judete) {
        if (judet === selectJudet.value) {
            for (localitate of judet.localitati) {
                const option = document.createElement(option);
                option.value = localitate.nume;
                option.innerText = localitate.nume;
                locSelect.appendChild(option)
            }
        }
    }
})