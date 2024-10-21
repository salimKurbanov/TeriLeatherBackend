import { unlinkSync } from "bun:fs"

const upload = {}

upload.image = async (name, image) => {
    try {
        if(image === 'undefined') {
            return {success: false}
        }
        await Bun.write(`./images/${name}`, image)
        return {success: true}
    } catch(e) {
        return {success: false}
    }
}

upload.getImage = (name) => {
    let image = Bun.file(`./images/${name}`)
    if(image.size === 0) {
        return Bun.file('./images/default.webp') //Заглушка если нету изображения
    } else {
        return image
    }
}

upload.deleteImage = (name) => {
    let image = Bun.file(`./images/${name}`)
    if(image.size !== 0) {
        return unlinkSync(`./images/${name}`)
    }
}

export default upload