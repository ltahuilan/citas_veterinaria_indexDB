//variables
let DB;
const mascotaInput = document.getElementById('mascota');
const propietarioInput = document.getElementById('propietario');
const telefonoInput = document.getElementById('telefono');
const fechaInput = document.getElementById('fecha');
const horaInput = document.getElementById('hora');
const sintomasInput = document.getElementById('sintomas');
const formularioCita = document.querySelector('#formulario-cita');
const contenedorCitas = document.querySelector('#citas');
const btnSubmit = document.querySelector('button[type="submit"');
const heading =document.querySelector('#heading');
let modoEdicion = false;

//objeto con la información de la cita
const citaObj = {
    mascota: '',
    propietario: '',
    telefono: '',
    fecha: '',
    hora: '',
    sintomas: '',
    id: ''
}

window.onload = () => {
    eventListener();
    crearDB();
}

function eventListener() {
    mascotaInput.addEventListener('input', datosCita);
    propietarioInput.addEventListener('input', datosCita);
    telefonoInput.addEventListener('input', datosCita);
    fechaInput.addEventListener('input', datosCita);
    horaInput.addEventListener('input', datosCita);
    sintomasInput.addEventListener('input', datosCita);
    formularioCita.addEventListener('submit', guardarCita);
}

//nena el objeto citaObj
function datosCita(e) {
    citaObj[e.target.name] = e.target.value;
}


class UI {

    async mostrarAlerta(mensaje, tipo) {

        if(tipo === 'error') {
            Swal.fire({
                icon: 'error',
                title: mensaje,
                // text: mensaje,
            })
            return;
        }

        if(tipo === 'success') {
            Swal.fire({
                icon: 'success',
                title: mensaje,
                // text: mensaje,
            })
            return;
        }

        const resultado = await Swal.fire({
            title: '¿Eliminar cita?',
            text: 'Se eliminará la cita permanentemente',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#28B62C',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, eliminar!',
            cancelButtonText: 'Cancelar'
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire(
                // '¡Correcto!',
                mensaje
              )
              return true;
              //return result; //retorna un arreglo
            }
            return false;
          })
        return resultado;
    }


    mostrarCitas() {
        
        this.limpiarHTML(contenedorCitas);
        
        //Leer las citas desde la BD
        const objectStore = DB.transaction('citas', 'readonly').objectStore('citas');
        
        //alias para el metodo textoHeading() para usar desde otra funcion con nivel interior
        const fnTextoHeading = this.textoHeading;

        const total = objectStore.count();
        total.onsuccess = function() {
            fnTextoHeading(total.result);
        }
        

        objectStore.openCursor().onsuccess = function(event) {
            const cursor = event.target.result;        

            //si el cursor contiene algo
            if(cursor) {
                //almacenar el objeto de la cita asociada
                const cita = cursor.value;

                const {id, mascota, propietario, telefono, fecha, hora, sintomas} = cita;
                

                const citaItem = document.createElement('LI');
                citaItem.dataset.id = id;
                citaItem.classList.add('cita');

                const mascotaParrafo = document.createElement('H2');
                mascotaParrafo.classList.add('card-title', 'font-weight-bold');
                mascotaParrafo.textContent = mascota;

                const propietarioParrafo = document.createElement('P');
                propietarioParrafo.innerHTML = `Propietario: <span class="font-weight-bold">${propietario}</span>`;
                const telefonoParrafo = document.createElement('P');
                telefonoParrafo.innerHTML = `Telefono: <span class="font-weight-bold">${telefono}</span>`;
                const fechaParrafo = document.createElement('P');
                fechaParrafo.innerHTML = `Fecha Cita: <span class="font-weight-bold">${fecha}</span>`;
                const horaParrafo = document.createElement('P');
                horaParrafo.innerHTML = `Hora Cita: <span class="font-weight-bold">${hora}</span>`;
                const sintomasParrafo = document.createElement('P');
                sintomasParrafo.innerHTML = `Síntomas: <span class="font-weight-bold">${sintomas}</span>`;

                const acciones = document.createElement('DIV');
                acciones.classList.add('d-flex', 'justify-content-around');

                //boton para eliminar
                const btnEliminar = document.createElement('BUTTON');
                btnEliminar.classList.add('btn', 'btn-danger', 'd-flex', 'align-items-center');
                btnEliminar.innerHTML = 'Eliminar <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>';
                btnEliminar.onclick = () => eliminarCita(id);
                
                //boton para editar
                const btnEditar = document.createElement('BUTTON');
                btnEditar.classList.add('btn-editar', 'btn', 'btn-info', 'd-flex', 'align-items-center');
                btnEditar.innerHTML = 'Editar <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>';
                btnEditar.dataset.id = id;
                btnEditar.onclick = () => cargarEdicion(cita, id);

                citaItem.appendChild(mascotaParrafo);
                citaItem.appendChild(propietarioParrafo);
                citaItem.appendChild(telefonoParrafo);
                citaItem.appendChild(fechaParrafo);
                citaItem.appendChild(horaParrafo);
                citaItem.appendChild(sintomasParrafo);
                citaItem.appendChild(acciones);
                acciones.appendChild(btnEliminar);
                acciones.appendChild(btnEditar);
    
                contenedorCitas.appendChild(citaItem);
                
                //ir al siguiente elemento 
                cursor.continue();
            }
        }
    }

    //muestra un encabzado condicionalmente si hay o no citas
    textoHeading(result) {
        if(result > 0) {
            heading.textContent = 'Administra tus Citas';
        }else {
            heading.textContent = 'No hay citas para mostrar';
        }
    }

    limpiarHTML(referencia) {
        while(referencia.firstChild) {
            referencia.removeChild(referencia.firstChild);
        }
    }
}

//instanciar UI
const ui = new UI();

function guardarCita(e) {

    e.preventDefault();

    //agregar un id
    if(citaObj['id'] === '') {
        citaObj['id'] = Date.now();
    }

    //validar los campos de la cita
    if(Object.values(citaObj).includes('')) {
        ui.mostrarAlerta('Todos los campos son requeridos','error');

        //termina el flujo y sale de la funcion, solo se puede utilizar dentro de una estructura if() cuando esta dentro de una funcion
        return;
    }

    //CREAR o EDITAR una cita
    if(modoEdicion) {
        //editar cita

        //cambiar el texto del boton submit
        btnSubmit.textContent = 'Crear Cita';

        //editar cita en indexDB
        const transaction = DB.transaction('citas', 'readwrite');
        const objectStore = transaction.objectStore('citas');
        objectStore.put(citaObj);

        transaction.oncomplete = function () {
            //reset modo edicion
            modoEdicion = false;
    
            //mostrar mensaje
            ui.mostrarAlerta('Cita editada correctamente','success');
        };

        transaction.onerror = function() {
            console.log('Ha ocurrido un error');
        }

    }else{

        //agregar al indexDB
        //crear la transaccion
        const transaction = DB.transaction('citas', 'readwrite' );

        //obtiene el almacen 
        const objectStore = transaction.objectStore('citas');

        //ejecuta la petición
        objectStore.add(citaObj);

        //todo OK
        transaction.oncomplete = function() {            
            //mostrar mensaje
            ui.mostrarAlerta('Cita creada correctamente','success');
        }

        //ocurrio un error
        objectStore.onerror = function() {
            console.log('Ha ocurrido un error');
        }
    }

    //reset al formulario
    formularioCita.reset();

    //Reset a los valores del objeto
    resetObjeto();

    //mostrar la cita
    ui.mostrarCitas();
    
}

function resetObjeto() {    
    for(const key in citaObj ){
        if(key !== 'id') {
            citaObj[key] = '';
        }
    }
}

async function eliminarCita(id) {
    console.log(id);
    //mostrar mensaje
    const resultado = await ui.mostrarAlerta('Cita eliminada correctamente', '');

    if(resultado) {
        const transaction = DB.transaction('citas', 'readwrite');
        const objectStore = transaction.objectStore('citas');
        objectStore.delete(id);

        transaction.oncomplete = function() {    
            //eliminar cita
            
            //refrescar HTML
            ui.mostrarCitas();
        }

        transaction.onerror = function() {
            console.log('Ha ocurrido un error en indexDB');
        }
    }

}

function cargarEdicion(cita) {

    const {id, mascota, propietario, telefono, fecha, hora, sintomas} = cita;

    //llenar el formulario
    mascotaInput.value = mascota;
    propietarioInput.value = propietario;
    telefonoInput.value = telefono;
    telefonoInput.value = telefono;
    fechaInput.value = fecha;
    horaInput.value = hora;
    sintomasInput.value = sintomas;

    //asignar valores a citaObj
    for(const key in citaObj) {
        citaObj[key] = cita[key];
    }

    //cambiar el texto del boton submit
    btnSubmit.textContent = 'Guardar Cambios';

    //activar el modo edicion
    modoEdicion = true;
}

/**
 * Base de datos con indexDB
 */
function crearDB() {
    const crearDB = window.indexedDB.open('citas', 1);

    //si hay error
    crearDB.onerror = function() {
        console.log('Se ha producido un error en indexDB');
    }

    //todo OK
    crearDB.onsuccess = function() {
        console.log('Se ha creado la conexión a la BD correctamente...');
        DB = crearDB.result;        
        //mostrar citas
        ui.mostrarCitas();
    }

    //crear el schema de las BD, solo se ejecuta si no existe la BD
    crearDB.onupgradeneeded = function(event) {
        const db = event.target.result; //contiene la misma información que crearDB
        
        const objetcStore = db.createObjectStore('citas', {
            keyPath: 'id',
            autoIncrement: true
        });

        //definir las columnas de la BD
        objetcStore.createIndex('mascota', 'mascota', { unique:false });
        objetcStore.createIndex('propietario', 'propietario', { unique:false });
        objetcStore.createIndex('telefono', 'telefono', { unique:false });
        objetcStore.createIndex('fecha', 'fecha', { unique:false });
        objetcStore.createIndex('hora', 'hora', { unique:false });
        objetcStore.createIndex('sintomas', 'sintomas', { unique:false });
        objetcStore.createIndex('id', 'id', { unique:true });

        console.log('Data Base creada...');
    }
}
