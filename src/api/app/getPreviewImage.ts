import * as htmlToImage from 'html-to-image'
import staticServer from '../upload/staticServer'

export interface GetPreviewImageProps {
  element: HTMLDivElement
  name?: string
}
const getPreviewImage = async ({ element, name }: GetPreviewImageProps) => {
  if (!element) {
    throw new Error('element is null')
  }

  const div = document.createElement('div')

  div.style.width = 'fit-content'
  div.appendChild(element)
  document.body.append(div)

  const imageBlob = await htmlToImage.toBlob(element)

  document.body.removeChild(div)

  const res = await staticServer({
    content: imageBlob,
    folderPath: `/imgs/${Date.now()}`,
    fileName: name || `${uuid()}.png`,
  }) as { url: string }
  
  return res.url
}

function uuid(pre = 'u_', len = 6) {
  const seed = 'abcdefhijkmnprstwxyz0123456789', maxPos = seed.length;
  let rtn = '';
  for (let i = 0; i < len; i++) {
    rtn += seed.charAt(Math.floor(Math.random() * maxPos));
  }
  return pre + rtn;
}

export default getPreviewImage