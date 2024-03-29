const selectGazde = document.querySelector('.select-gazde')
const selectOaspeti = document.querySelector('.select-oaspeti')
//const listaGazde = document.querySelector('.lista-gazde')
//const listaOaspeti = document.querySelector('.lista-oaspeti')
let i = 1
let j = 100

function select() {
    this.parentElement.parentElement.parentElement.classList.toggle('pressed')
    this.parentElement.parentElement.parentElement.classList.toggle('notPressed')
    this.parentElement.classList.toggle('checkActive')
    this.parentElement.classList.toggle('checkInactive')

    //console.log(this.checked)

    if (!this.checked) {
        //console.log(this.parentElement.nextElementSibling.children[0])
        const inputJoaca = this.parentElement.nextElementSibling.children[0]

        console.log(inputJoaca.checked)

        if (inputJoaca.checked) {
            inputJoaca.checked = 0;
            inputJoaca.parentElement.classList.toggle('checkActive')
            inputJoaca.parentElement.classList.toggle('checkInactive')
        }
    }
}
function score() {
    this.parentElement.classList.toggle('checkActive')
    this.parentElement.classList.toggle('checkInactive')
    //console.log(this.parentElement.previousElementSibling)
    const input1 = this.parentElement.previousElementSibling.children[0];
    if (!input1.checked) {
        input1.checked = true;
        input1.dispatchEvent(new Event('change'))
    }

}

function listenForSelect() {
    const listaGazde = this.parentElement.nextElementSibling;
    listaGazde.innerHTML = '';
    const p = document.createElement('p');
    p.innerText = "Stelectati primul 11"
    listaGazde.appendChild(p)
    fetch(`http://localhost:2000/api/${this.value}`)
        .then(response => { return response.json() })
        .then(data => {
            //console.log(data)

            for (player of data.squad) {
                const label = document.createElement('label');
                label.for = i;
                label.classList.add('mx-2');
                const div1 = document.createElement('div');
                div1.classList.add('card');
                div1.classList.add('mb-2');
                div1.classList.add('notPressed')


                div1.style.width = '8rem';
                label.appendChild(div1);
                const img = document.createElement('img');
                img.classList.add('card-img-top');
                img.src = player.photo;
                img.style.height = '80px'
                img.style.objectFit = 'cover'
                img.style.objectPosition = 'top'
                div1.appendChild(img);

                const div2 = document.createElement('div');
                div2.classList.add('card-body');
                div2.classList.add('form-check');
                div2.classList.add('form-switch');
                div2.style.padding = '5px'
                div1.appendChild(div2);

                const h5 = document.createElement('h5');
                h5.classList.add('card-title');
                h5.style.fontSize = '0.75rem'
                h5.innerText = player.first + ' ' + player.last;
                div2.appendChild(h5);

                const labelJoc = document.createElement('label');
                labelJoc.innerText = 'Joaca'
                //marcator.type = 'checkbox'
                //marcator.classList.add('marcator')
                labelJoc.classList.add('labelMar')
                labelJoc.classList.add('checkInactive')

                const input = document.createElement('input');
                input.type = 'checkbox'
                input.classList.add('hideInput')

                //input.classList.add('form-check-input')
                input.id = i++;
                const prefix = this.name.split('_')[0]
                input.name = prefix + '_players';
                input.value = player._id;

                input.addEventListener('change', select)

                div2.appendChild(labelJoc)
                labelJoc.appendChild(input);


                const marcator = document.createElement('input');
                const labelMar = document.createElement('label');

                labelMar.innerText = 'Marcator'
                marcator.type = 'checkbox'
                marcator.classList.add('hideInput')

                labelMar.classList.add('labelMar')
                labelMar.classList.add('checkInactive')

                marcator.name = prefix + '_goals';
                marcator.value = player._id;
                div2.appendChild(labelMar);
                labelMar.appendChild(marcator);

                marcator.addEventListener('change', score)

                //marcator.addEventListener('click', select)




                listaGazde.appendChild(label);
            }
        })
        .catch(err => console.log(err))
}

selectGazde.addEventListener('change', listenForSelect)

selectOaspeti.addEventListener('change', listenForSelect)