const selectGazde = document.querySelector('.select-gazde')
const selectOaspeti = document.querySelector('.select-oaspeti')
//const listaGazde = document.querySelector('.lista-gazde')
//const listaOaspeti = document.querySelector('.lista-oaspeti')
let i = 1

function select() {
    this.parentElement.parentElement.classList.toggle('pressed')
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
                // const label = document.createElement('label');
                // const input = document.createElement('input');
                // input.type = 'checkbox';
                // label.innerText = player.first + ' ' + player.last;
                // const prefix = this.name.split('_')[0]
                // input.name = prefix + '_players';
                // input.value = player._id;
                // input.classList.add('form-check-input');
                // label.classList.add('form-check-label')
                // label.appendChild(input);

                // listaGazde.appendChild(label)

                // const br = document.createElement('br');
                // listaGazde.appendChild(br)
                // //console.log(p.innerText)

                const label = document.createElement('label');
                label.for = i;
                // label.style.marginLeft = 'auto';
                // label.style.marginRight = 'auto';
                label.classList.add('mx-2');
                const div1 = document.createElement('div');
                div1.classList.add('card');
                div1.classList.add('mb-2');


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
                div2.style.padding = '5px'
                div1.appendChild(div2);
                const h5 = document.createElement('h5');
                h5.classList.add('card-title');
                h5.style.fontSize = '0.75rem'
                h5.innerText = player.first + ' ' + player.last;
                div2.appendChild(h5);
                const input = document.createElement('input');
                input.type = 'checkbox'
                input.id = i++;
                const prefix = this.name.split('_')[0]
                input.name = prefix + '_players';
                input.value = player._id;
                input.addEventListener('click', select)
                div2.appendChild(input);

                listaGazde.appendChild(label);
            }
        })
        .catch(err => console.log(err))
}

selectGazde.addEventListener('change', listenForSelect)

selectOaspeti.addEventListener('change', listenForSelect)