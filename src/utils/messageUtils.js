export const isCommand = (msgContent) => msgContent.slice(0, 1) === '!'
export const getContent = (msgContent) => msgContent.slice(1)