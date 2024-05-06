const itemName = 'imagenes'
const item_name_token = 'token'
const read = () => {
    const store = localStorage.getItem(itemName);
    return store ? JSON.parse(store) : []
}

const write = content => {
    localStorage.setItem(itemName, JSON.stringify(content))
}

const grabarJWT = datosJWT => {


    localStorage.setItem(item_name_token, JSON.stringify(datosJWT))
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
    write,
    update,
    destroy
}