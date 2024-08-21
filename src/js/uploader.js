import { read, write, grabarJWT, LeerJWT, update, destroy } from './localStorage.js'
import { GrabarJWTsession as guardar, LeerJWTsession as leerSJwt } from './SessionStorage.js';
import * as faceapi from 'face-api.js'
import { v5 as uuidv5, v4 as uuidv4 } from 'uuid';
import { ImageDTO } from '../dto/object_image.js';
import { load_images_faces, generated_jwt, load_data_user, verify_token, generated_id_face, receivedFiles_bd } from './crud'
window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

const getImg = async (id_imagen_selector) => {
    const id = id_imagen_selector.value
    receivedFiles_bd(id)
}
const idimagedisabled = document.querySelector('#id_image')

const FaceDetector = (imagesListSelector) => {
    const imagesList = document.querySelector(imagesListSelector);

    // imagesList.style.display = 'none';
    const imageDescriptors = [];
    let faceMatcher;

    const syncImages = async () => {
        while (imagesList.firstChild) {
            imagesList.removeChild(imagesList.firstChild)
        }
        const images = await load_images_faces();
        let i = 0;
        images.forEach(async image => {
            const imageContainer = document.createElement('div');
            const label = document.createElement('input');
            const imageElement1 = document.createElement('img');
            const imageElement = new Image();
            imageElement.crossOrigin = 'anonymous'; // Para evitar problemas con CORS
        
            const status = document.createElement('div');
            const deleteLink = document.createElement('a');
            // imageContainer.style.display = 'none';
            //  imageElement.style.display = 'none';
            //  status.style.display = 'none';
            //   deleteLink.style.display = 'none';
            imageContainer.classList.add('image-container');
            deleteLink.classList.add('cerrar');
            imageElement.classList.add('card-img-top');
            //imageContainer.id = image.id;
            imageContainer.id = image.id_identy_facial
            deleteLink.href = "#";
            deleteLink.innerText = "x";
            status.classList.add('status');
            status.innerText = 'Pendiente';
            //imageElement.src = await fileEntryPathToObjectUrl(image.path);
            const serv = 'http://127.0.0.1:5000/uploads/access'
            imageElement.src = `${serv}${image.file}`
            label.value = uuidv4().toString();
            imageContainer.appendChild(deleteLink);
            imageContainer.appendChild(status);
            imageContainer.appendChild(imageElement);
            imageContainer.appendChild(label);
            imagesList.appendChild(imageContainer)
            processFace(imageElement, imageContainer, image.id_identy_facial);


        })

    }


    const processFace = async (imageElement, imageContainer, identy) => {


        const detection = await faceapi.detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor()
        if (typeof detection === 'undefined') {

            imageContainer.querySelector('.status').innerText = 'No tiene cara';
        };

        imageDescriptors.push({
            id: identy,
            detection
        });
        imageContainer.querySelector('.status').innerText = 'Procesado';
        faceMatcher = new faceapi.FaceMatcher(imageDescriptors.map(faceDescriptor => (
            new faceapi.LabeledFaceDescriptors(
                (faceDescriptor.id).toString(), [faceDescriptor.detection.descriptor]
            )
        )));
    }

    syncImages();
    let contador = 0;
    let rostroAnterior = null;
    const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const desface = descriptor => {
        if (!faceMatcher || !descriptor) return;
        const match = faceMatcher.findBestMatch(descriptor);

        [...imagesList.children].forEach(async image => {

            if (match.label === image.id) {
                if (match.label !== rostroAnterior) {
                    contador = 1; // Reiniciar contador si es un rostro nuevo
                    rostroAnterior = match.label;
                } else {
                    contador += 1;

                }

                if (contador == 10) {
                    const carga = await generated_jwt(match.label.toString());
                    const payload = await carga.json;
                    const status = carga.status;

                    if (payload.success == true && status == 201) {
                        await guardar(payload.token);
                        console.log('token Grabado En SessionStorage: ' + payload.token)
                        await esperar(10000);
                        contador = 0;
                        //const token = await LeerJWT();
                        const token = await leerSJwt();
                        if (token) {
                            console.log('token Leido De SessionStorage: ' + token);
                            const validatetoken = await verify_token(token);

                            const dataUser = await validatetoken.json;
                    
                            console.log(dataUser);
                            console.log(`Te Reconoci ${dataUser.data.name}`)


                        } else { console.log('Error Al Leer Token En SessionStorage: ' + token); }

                        
                    } else { console.log('Existe Un Error'); }

                }

                image.classList.add('selected');
            } else {
                image.classList.remove('selected');
            }
        });

        return match;
    }



    const subirinfo = document.querySelector('#subirinfo')


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
        await load_data_user(image.files[0], dataUser) //const id_face_trans =
        //console.log(id_face_trans)

        ///Luego Se Subir La Imagen Con El Id Generado Desde  Backend, Guardo El PATH Localmente EN TEMPORARY DEl NAVEGADOR
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

    return { desface, syncImages }
}



/*

const fileEntryPathToObjectUrl = async fileEntryPath => {
    return URL.createObjectURL(await new Promise((resolve, reject) => {
        window.requestFileSystem(window.TEMPORARY, 1024 * 1024, function (fs) {
            fs.root.getFile(fileEntryPath, { create: true, exclusive: false }, function (fileEntry) {
                fileEntry.file(resolve, reject)
            }, e => console.log(e));
        })
    }))
}
        */

export { FaceDetector, getImg };