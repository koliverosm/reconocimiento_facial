import { read, write, update, destroy } from './localStorage.js'
import * as faceapi from 'face-api.js'
import { v5 as uuidv5, v4 as uuidv4 } from 'uuid';
import { ImageDTO } from '../dto/object_image.js';
import { generated_jwt, load_data_user, verify_token, generated_id_face, receivedFiles_bd } from './crud'
window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

const getImg = async (id_imagen_selector) => {
    const id = id_imagen_selector.value
    receivedFiles_bd(id)
}

const FaceDetector = (imagesListSelector) => {
    const imagesList = document.querySelector(imagesListSelector);
    // imagesList.style.display = 'none';
    const imageDescriptors = [];
    let faceMatcher;

    const syncImages = () => {
        while (imagesList.firstChild) {
            imagesList.removeChild(imagesList.firstChild)
        }
        read().forEach(async image => {
            const imageContainer = document.createElement('div');
            const label = document.createElement('input');
            const imageElement = document.createElement('img');
            const status = document.createElement('div');
            const deleteLink = document.createElement('a');
            // imageContainer.style.display = 'none';
            //  imageElement.style.display = 'none';
            //  status.style.display = 'none';
            //   deleteLink.style.display = 'none';
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

            label.value = image.name;

            label.addEventListener('keyup', e =>
                update(image.id, {
                    name: e.target.value
                }))
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


    syncImages();
    let contador = 0;

    const desface = descriptor => {
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
    return { desface, syncImages }
}







const idimagedisabled = document.querySelector('#id_image')


const fileEntryPathToObjectUrl = async fileEntryPath => {
    return URL.createObjectURL(await new Promise((resolve, reject) => {
        window.requestFileSystem(window.TEMPORARY, 1024 * 1024, function (fs) {
            fs.root.getFile(fileEntryPath, { create: true, exclusive: false }, function (fileEntry) {
                fileEntry.file(resolve, reject)
            }, e => console.log(e));
        })
    }))
}


export { FaceDetector, getImg };