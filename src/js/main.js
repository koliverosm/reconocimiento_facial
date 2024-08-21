import 'babel-polyfill'
import * as faceapi from 'face-api.js'
import { FaceDetector } from './uploader.js'
const loadModels = async () => {
    await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models')
    ]);
};

const DenegarCamara = document.querySelector('#DenegarAccesoCamara')
const CerrarModal = document.querySelector('#CerrarModal');
const DetectarUsuario = async () => {
    await loadModels();
    const videoContainer = document.querySelector('.js-video');
    const canvas = document.querySelector('.js-canvas');
    const context = canvas.getContext('2d');
    const video = await navigator.mediaDevices.getUserMedia({ video: true });
    videoContainer.srcObject = video;
    const detector = FaceDetector('.images-list');
    const reDraw = async () => {
        context.drawImage(videoContainer, 0, 0, 640, 480);
        requestAnimationFrame(reDraw);
    };
    const match = detector.desface
    
    // Compara las imagenes en linea
    const process_face_online = async () => {
        const detection = await faceapi.detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (typeof detection === 'undefined') return;
        match(detection.descriptor);
    };

    const fps = 2; // Detección cada 0.5 segundos
    setInterval(process_face_online, 1000 / fps);
    requestAnimationFrame(reDraw);

    // -- Acciones Para Cerrar La Transmicion De Video --
    const stopVideoStream = () => {
        if (video) {
            video.getTracks().forEach(track => track.stop());
        }
    };


    DenegarCamara.addEventListener('click', stopVideoStream)
    CerrarModal.addEventListener('click', stopVideoStream)

};




//-------------------------------------------------------------
// -------  Permitir Que Nami Vea Al Usuario  Para Procesar La Solicitud ----
const AbrirCamara = document.querySelector('#AccesoCamara')
AbrirCamara.onclick = async () => {

    await DetectarUsuario();
    abrirnotificacion()
    // appendAlert('Excelente , Ahora ya tengo vista para reconocerte !', 'success')
}
//--------------------------------------------------


///--  Notificacion despues de que nami comienza a ver el usuario
const toastLiveExample = document.getElementById('liveToast')
const abrirnotificacion = () => {
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
    toastBootstrap.show();
}
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


