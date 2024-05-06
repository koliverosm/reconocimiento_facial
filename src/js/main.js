import 'babel-polyfill'
import * as faceapi from 'face-api.js'
import FaceDetector from './uploader.js'


const loadModels = async () => {
    await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models')
    ]);
};

const DetectarUsuario = async () => {
    await loadModels();

    const videoContainer = document.querySelector('.js-video');
    const canvas = document.querySelector('.js-canvas');
    const context = canvas.getContext('2d');
    const video = await navigator.mediaDevices.getUserMedia({ video: true });
    videoContainer.srcObject = video;

    const reDraw = async () => {
        context.drawImage(videoContainer, 0, 0, 640, 480);
        requestAnimationFrame(reDraw);
    };

    const match = FaceDetector('.images-list');
    const processFace = async () => {
        const detection = await faceapi.detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (typeof detection === 'undefined') return;
        match(detection.descriptor);
    };

    const fps = 2; // Detección cada 0.5 segundos
    setInterval(processFace, 1000 / fps);
    requestAnimationFrame(reDraw);
};



const CerrarCamara = () => {


}

//-------Si El Usuario Denega El Acceso Nami
const DenegarCamara = document.querySelector('#DenegarAccesoCamara')

DenegarCamara.onclick = () => { console.log(DenegarCamara) }

//-------------------------------------------------------------
// -------  Permitir Que Nami Vea Al Usuario  Para Procesar La Solicitud ----
const AbrirCamara = document.querySelector('#AccesoCamara')
AbrirCamara.onclick = async () => {

    await DetectarUsuario();
    appendAlert('Excelente , Ahora ya tengo vista para reconocerte !', 'success')
}
//--------------------------------------------------

//----Traer La Imagen De La base De Datos

const consultar = document.querySelector('#consultar');

const alertPlaceholder = document.getElementById('AlertMessageView')
const appendAlert = (message, type) => {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
    ].join('')

    alertPlaceholder.append(wrapper)
}


