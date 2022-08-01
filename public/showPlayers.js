const selectGazde = document.querySelector('.select-gazde')
const selectOaspeti = document.querySelector('.select-oaspeti')
//const listaGazde = document.querySelector('.lista-gazde')
//const listaOaspeti = document.querySelector('.lista-oaspeti')

function listenForSelect() {
    // while (listaGazde.childNodes) {
    //     listaGazde.removeChild
    // }
    const listaGazde = this.parentElement.nextElementSibling;
    // console.log(this)
    // console.log(this.parentElement)
    // console.log(listaGazde)
    listaGazde.innerHTML = '';
    const p = document.createElement('p');
    p.innerText = "Stelectati primul 11"
    listaGazde.appendChild(p)
    //listaGazde.innerHTML = 'Hai Salut'

    console.log(this.value)
    fetch(`http://localhost:2000/api/${this.value}`)
        .then(response => { return response.json() })
        .then(data => {
            console.log(data)
            for (player of data.squad) {
                const label = document.createElement('label');
                const input = document.createElement('input');
                input.type = 'checkbox';
                label.innerText = player.first + ' ' + player.last;
                const prefix = this.name.split('_')[0]
                input.name = prefix + '_players';
                input.value = player._id;
                input.classList.add('form-check-input');
                label.classList.add('form-check-label')
                label.appendChild(input);

                listaGazde.appendChild(label)

                const br = document.createElement('br');
                listaGazde.appendChild(br)
                //console.log(p.innerText)
            }
        })
        .catch(err => console.log(err))
}

selectGazde.addEventListener('change', listenForSelect)

selectOaspeti.addEventListener('change', listenForSelect)

