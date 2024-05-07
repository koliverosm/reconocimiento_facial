const item_name_token = 'token'
const GrabarJWTsession = datosJWT => {
    sessionStorage.setItem(item_name_token, JSON.stringify(datosJWT))

}
const LeerJWTsession = () => {
    const token = sessionStorage.getItem(item_name_token);
    return token ? JSON.parse(token) : null;
}
export {GrabarJWTsession ,LeerJWTsession}