import { write, read } from "./localStorage";
import { v4 as uuidv4 } from 'uuid';
import { FaceDetector } from "./uploader";

window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

const receivedFiles_bd = async (id_file) => {
    try {
        const response = await fetch('http://127.0.0.1:5000/uploads/getfoto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'id': id_file })
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
        const detector = FaceDetector('.images-list');
        detector.syncImages

    } catch (error) {
        console.error('Error al recibir el archivo:', error);
    }
};


/////////////POST 
const load_data_user = (file, dataUser) => {

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
        }).then(payload => {
            resolve(payload); console.log('Todo Perfecto:', payload);
            idimagedisabled.value = ''
        }).catch(error => {
            console.error('Error al subir el archivo:', error);
        });

    })




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
            resolve({ json: response.json(), status: response.status });
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
            resolve({ json: response.json(), status: response.status });
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

export { uploadFile, generated_jwt, verify_token, generated_id_face, load_data_user, receivedFiles_bd }

