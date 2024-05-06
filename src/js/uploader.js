import { read, write, update, destroy } from './localStorage.js'
import * as faceapi from 'face-api.js'
import { v5 as uuidv5, v4 as uuidv4 } from 'uuid';
import { ImageDTO } from '../dto/object_image.js';

window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

const FaceDetector =  (imagesListSelector) => {
   // const submit = document.querySelector(submitSelector);
    
    const id_imagen = document.querySelector('#id_imagen')
    const consultar = document.querySelector('#consultar');
    const imagesList = document.querySelector(imagesListSelector);
     imagesList.style.display = 'none';
    const imageDescriptors = [];
    let faceMatcher;

    //Evento De Consultar La Foto Por ID
    consultar.addEventListener('click', async e => {
        console.log(e);
        const id = id_imagen.value
        receivedFiles_bd(id)

    })

    const receivedFiles_bd = async (dataForVerification) => {
        try {
            const response = await fetch('http://127.0.0.1:5000/uploads/getfoto', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 'id': dataForVerification })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // Asumiendo que 'data' incluye { nombre: 'nombreDelArchivo', archivo: 'foto_base64' }
            console.log('Archivo Recibido:', data);
            // Ejemplo de cómo podrías usar la imagen Base64 para mostrarla en un <img>
            const img = document.createElement('img');
            img.src = `data:image/png;base64,${data.file}`; // Asegúrate de usar el tipo MIME correcto
            document.body.appendChild(img);
            // Convierte base64 a Blob
            const base64toBlob = (base64Data, contentType) => {
                const sliceSize = 512;
                const byteCharacters = atob(base64Data);
                const byteArrays = [];
                for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                    const slice = byteCharacters.slice(offset, offset + sliceSize);
                    const byteNumbers = new Array(slice.length);
                    for (let i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    byteArrays.push(byteArray);
                }
                const blob = new Blob(byteArrays, { type: contentType });
                return blob;
            };
            const contentType = 'image/png'; // Asegúrate de usar el tipo MIME correcto para tu imagen
            const blob = base64toBlob(data.file, contentType);
            const fileEntry = await uploadFile(blob);
            write([
                ...read(),
                {
                    id: `${data.id_face}`,
                    path: fileEntry.fullPath,
                    name: (uuidv4()).toString() //(fileEntry.name)
                }
            ])
            console.log(localStorage.getItem('imagenes'));
            syncImages()

        } catch (error) {
            console.error('Error al recibir el archivo:', error);
        }
    };

    const processFace = async (image, imageContainer, id) => {
        const detection = await faceapi.detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor()
        if (typeof detection === 'undefined') {
            imageContainer.querySelector('.status').innerText = 'No tiene cara';
            return
        };

        imageDescriptors.push({
            id: id,
            detection
        });
        imageContainer.querySelector('.status').innerText = 'Procesado';

        faceMatcher = new faceapi.FaceMatcher(imageDescriptors.map(faceDescriptor => (
            new faceapi.LabeledFaceDescriptors(
                (faceDescriptor.id).toString(), [faceDescriptor.detection.descriptor]
            )
        )))
    }
    const syncImages = () => {
     //   while (imagesList.firstChild) {
     //       imagesList.removeChild(imagesList.firstChild)
     //   }
        read().forEach(async image => {
            const imageContainer = document.createElement('div');
          //  const label = document.createElement('input');
            const imageElement = document.createElement('img');
            const status = document.createElement('div');
            const deleteLink = document.createElement('a');
            imageContainer.style.display = 'none';
          //  imageElement.style.display = 'none';
            status.style.display = 'none';
            deleteLink.style.display = 'none';
            imageContainer.classList.add('image-container');
            deleteLink.classList.add('cerrar');
            imageElement.classList.add('card-img-top');
            imageContainer.id = image.id;
            deleteLink.href = "#";
            deleteLink.innerText = "x";
            status.classList.add('status');

            status.innerText = 'Pendiente';
            imageElement.src = await fileEntryPathToObjectUrl(image.path);
            //console.log(image);
           
        //    label.value = image.name;

         //   label.addEventListener('keyup', e =>
         //       update(image.id, {
          //          name: e.target.value
         //       }))
            deleteLink.addEventListener('click', e => {
                e.preventDefault();
                destroy(image.id)
                syncImages();
            })

            imageContainer.appendChild(deleteLink);
            imageContainer.appendChild(status);
            imageContainer.appendChild(imageElement);
         //   imageContainer.appendChild(label);

            imagesList.appendChild(imageContainer)
            processFace(imageElement, imageContainer, image.id);
        })
    }

    const subirinfo = document.querySelector('#subirinfo')
    
    //const userform = document.querySelector('#userForm')

   
    subirinfo.addEventListener('click', async captura => {
        captura.preventDefault()

        
        const image = document.querySelector('#image');
        const username = document.querySelector('#usernames');
        const password = document.querySelector('#password');
        const email = document.querySelector('#email');
        const g_id_face = await generated_id_face();
        const dataUser = { 'username': username.value, 'password': password.value, 'email': email.value, 'id_face': g_id_face }
        idimagedisabled.value = `${g_id_face}`
        const fileEntry = await uploadFile(image.files[0]);
        await __send_file_and_data_servidor(image.files[0], dataUser) //const id_face_trans =
        //console.log(id_face_trans)

        ///Luego Se Subir La Imagen Con El Id Generado Desde  Backend Lo Guardo Localmente EN TEMPORARY DEl NAVEGADOR
        write([
            ...read(),
            {
                id: g_id_face,
                path: fileEntry.fullPath,
                name: (uuidv4()).toString() //(fileEntry.name)
            }
        ])
      
        console.log(localStorage.getItem('imagenes'));
        syncImages()
    })

   // submit.addEventListener('change', async e => {
   //     const fileEntry = await uploadFile(e.target.files[0]);
   //     const id_face_trans = await __send_file_Servidor(e.target.files[0])
  //      idimagedisabled.value = id_face_trans
  //      console.log("id_face_trans: ", id_face_trans);
        // console.log("propiedades:", fileEntry);
  //      write([
  //          ...read(),
  //          {
  //              id: id_face_trans,
  //              path: fileEntry.fullPath,
  //              name: (uuidv4()).toString() //(fileEntry.name)
  //          }
 //       ])
  //      console.log(localStorage.getItem('imagenes'));
   //     syncImages()
   // }
  //  )

    syncImages();
    let contador = 0;

    return descriptor => {
        if (!faceMatcher || !descriptor) return;
        const match = faceMatcher.findBestMatch(descriptor);
        // console.log('Que es Descriptor: ' + descriptor);
        [...imagesList.children].forEach(async image => {

            if (match.label === image.id) {
                contador += 1;
                //console.log(`compatible`,contador)
                //  console.log(`Estoy Comparando Match.Label ${match.label} y imageid ${image.id}`)
                if (contador > 5) {

                    const payload = await generated_jwt(`${match.label}`)
                    const validatetoken = await verify_token(payload.token)
                    // console.log("Se Valido El  Token? ", validatetoken.data.username)
                    // console.log('Otra Vista', validatetoken.message)
                    contador = 0;
                    // alert(`Hola!!  Bienvenido Maricon ${validatetoken.data.username} `)
                    console.log(`Te Reconoci ${validatetoken.data.username}`)
                }

                image.classList.add('selected');
                return
            }
            return image.classList.remove('selected')
        })

        return match
    }
}




const uploadFile = file => {
    return new Promise((resolve, reject) => {
        window.requestFileSystem(window.TEMPORARY, 1024 * 1024, function (fs) {
            fs.root.getFile(`${file.name}${uuidv4()}`, { create: true, exclusive: true }, function (fileEntry) {
                fileEntry.createWriter(function (fileWriter) {
                    fileWriter.write(file);
                    resolve(fileEntry)
                }, e => console.log(e));
            }, e => console.log(e));
        })
    })
}


const __send_file_Servidor = (file) => {
    return new Promise((resolve, reject) => {
        const filename = `${file.name}`
        const formData = new FormData();
        formData.append('image', file, filename);
        //console.log('Datos Preparados para Mandar ala api', file, filename)

        fetch('http://127.0.0.1:5000/uploads/file', {
            method: 'POST',
            body: formData,
        }).then(response => {

            return response.json(); // Esto devuelve una promesa que resuelve con el objeto JSON.
        }).then(payload => {
            const id_face = payload['generated']
            resolve(id_face);
            // Ahora 'payload' es el objeto JSON resuelto.
            console.log('Archivo subido con éxito:', payload['generated']);

        }).catch(error => {
            console.error('Error al subir el archivo:', error);
        });

    })

}
const idimagedisabled = document.querySelector('#id_image')
const __send_file_and_data_servidor = (file, dataUser) => {

    return new Promise((resolve, reject) => {
        const filename = `${file.name}`
        const formData = new FormData();
        formData.append('image', file, filename);
        formData.append('dataUser', JSON.stringify(dataUser)); //dataUser es un objeto JSON con los datos del usuario

        for (let entry of formData.entries()) {
            console.log('Esto LLevo', entry);
        }
        fetch('http://127.0.0.1:5000/uploads/adminFile', {
            method: 'POST',
            body: formData,
        }).then(response => {

            return response.json(); 
        }).then(payload => {resolve(payload);console.log('Todo Perfecto:', payload);
        idimagedisabled.value = ''
        }).catch(error => {
            console.error('Error al subir el archivo:', error);
        });

    })




}

const fileEntryPathToObjectUrl = async fileEntryPath => {
    return URL.createObjectURL(await new Promise((resolve, reject) => {
        window.requestFileSystem(window.TEMPORARY, 1024 * 1024, function (fs) {
            fs.root.getFile(fileEntryPath, { create: true, exclusive: false }, function (fileEntry) {
                fileEntry.file(resolve, reject)
            }, e => console.log(e));
        })
    }))
}


const generated_jwt = async id_face_match => {

    return new Promise((resolve, reject) => {
        fetch('http://127.0.0.1:5000/autenticacion/generated_token_face', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'id_face_identy': id_face_match })
        }).then(response => {
            //console.log('Esta Es la Repuesta Response: ', response)
            const responses = response.json()
            return responses;
        }).then(payload => {
            resolve(payload);
            // console.log('Archivo subido con éxito:', payload['token']);

        }).catch(error => {
            console.error('Error al subir el archivo:', error);
        });

    })

};

const verify_token = async token => {

    return new Promise((resolve, reject) => {
        fetch('http://127.0.0.1:5000/verify_token/now', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        }).then(response => {
            // console.log('Esta Es la De Validar Token: ', response)
            return response.json(); // Esto devuelve una promesa que resuelve con el objeto JSON.
        }).then(payload => {
            //const id_face = payload['generated']
            resolve(payload);
            // Ahora 'payload' es el objeto JSON resuelto.
            console.log('data:', payload);
        })
    })
}

const generated_id_face = async () => {
    const response = await fetch('http://127.0.0.1:5000/uploads/generated', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data['generated']
}

export default FaceDetector