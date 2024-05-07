const itemName = 'imagenes'
const item_name_token = 'token'

// ----- Acciones Con JWT 

const grabarJWT = datosJWT => {


    localStorage.setItem(item_name_token, JSON.stringify(datosJWT))
}

const LeerJWT = () => {
    const token = localStorage.getItem(item_name_token);
    return token ? JSON.parse(token) : null;
}

//------------------------------------------------





const read = () => {
    const store = localStorage.getItem(itemName);
    return store ? JSON.parse(store) : []
}

const write = content => {
    localStorage.setItem(itemName, JSON.stringify(content))
}



const update = (id, content) => {
    const tmp = [...read()];
    const index = tmp.findIndex(item => item.id === id)
    tmp[index] = {
        ...tmp[index],
        ...content
    }
    write(tmp)
}

const destroy = id => {
    const tmp = [...read()];
    const index = tmp.findIndex(item => item.id === id)
    tmp.splice(index, 1);
    write(tmp)
}

export {
    read,
    grabarJWT,
    LeerJWT,
    write,
    update,
    destroy
}