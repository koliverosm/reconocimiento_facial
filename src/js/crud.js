import { v4 as uuidv4 } from "uuid";

const load_images_faces = () => {
  return new Promise((resolve, reject) => {
    fetch("http://127.0.0.1:5000/uploads/access_all")
      .then((response) => response.json())
      .then((images) => {
        resolve(images);
      })
      .catch((error) => console.error("Error al obtener las imágenes:", error));
  });
};

const read_images_faces = (param1, param2) => {
  return new Promise((resolve, reject) => {
    fetch(`http://127.0.0.1:5000/uploads/access/${param1}/${param2}`)
      .then((response) => response.json())
      .then((images) => {
        resolve(images);
      })
      .catch((error) => console.error("Error al obtener las imágenes:", error));
  });
};

const load_data_user = (file, dataUser) => {
  return new Promise((resolve, _reject) => {
    const filename = `${file.name}`;
    const formData = new FormData();
    formData.append("image", file, filename);
    formData.append("dataUser", JSON.stringify(dataUser)); //dataUser es un objeto JSON con los datos del usuario

    for (let entry of formData.entries()) {
      console.log("Esto LLevo", entry);
    }
    fetch("http://127.0.0.1:5000/uploads/adminFile", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        return response.json();
      })
      .then((payload) => {
        resolve(payload);
        console.log("Todo Perfecto:", payload);
        idimagedisabled.value = "";
      })
      .catch((error) => {
        console.error("Error al subir el archivo:", error);
      });
  });
};

const generated_jwt = async (id_face_match) => {
  return new Promise((resolve, _reject) => {
    fetch("http://127.0.0.1:5000/autenticacion/generated_token_face", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id_face_identy: id_face_match }),
    })
      .then((response) => {
        //console.log('Esta Es la Repuesta Response: ', response)
        resolve({ json: response.json(), status: response.status });
      })
      .catch((error) => {
        console.error("Error al subir el archivo:", error);
      });
  });
};

const verify_token = async (token) => {
  return new Promise((resolve, _reject) => {
    fetch("http://127.0.0.1:5000/autenticacion/now", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).then((response) => {
      resolve({ json: response.json(), status: response.status });
    });
  });
};

const generated_id_face = async () => {
  const response = await fetch("http://127.0.0.1:5000/uploads/generated", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data["generated"];
};



const __send_file_Servidor = (file) => {
  return new Promise((resolve, _reject) => {
    const filename = `${file.name}`;
    const formData = new FormData();
    formData.append("image", file, filename);
    //console.log('Datos Preparados para Mandar ala api', file, filename)

    fetch("http://127.0.0.1:5000/uploads/file", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        return response.json(); // Esto devuelve una promesa que resuelve con el objeto JSON.
      })
      .then((payload) => {
        const id_face = payload["generated"];
        resolve(id_face);
        // Ahora 'payload' es el objeto JSON resuelto.
        console.log("Archivo subido con éxito:", payload["generated"]);
      })
      .catch((error) => {
        console.error("Error al subir el archivo:", error);
      });
  });
};

export {
  read_images_faces,
  load_images_faces,
  generated_jwt,
  verify_token,
  generated_id_face,
  load_data_user,
};
