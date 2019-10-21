
//Modulos necesarios para la aplicacion
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const url = require('url');
let mainWindows;
let newProductWindow;
const path = require('path');

//recargar automaticamente cuando se realice algun cambio
if (process.env.NODE_ENV !== 'production') {
require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '../node_modules', '.bin', 'electron')
});
}

//codigo de mi ventana principal
app.on('ready', () => {
    mainWindows = new BrowserWindow({});
    mainWindows.loadURL(url.format({
        pathname: path.join(__dirname, 'views/index.html'),
        protocol: 'file',
        slashes: true
    }));
    //cargar menu customizado
    const mainMenu = Menu.buildFromTemplate(templateMenu);
    Menu.setApplicationMenu(mainMenu);
    //escucha cuando se cierran las ventanas
    mainWindows.on('closed', () => {
        app.quit();
    });

});

//cargar una ventana emergente
function createNewProductWindow() {

    newProductWindow = new BrowserWindow({
        width: 400,
        height: 330,
        title: 'Add A New Product'
    });

    newProductWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views/new-product.html'),
        protocol: 'file',
        slashes: true
    }));

    newProductWindow.on('closed', () => {
        newProductWindow = null;
    })
    newProductWindow.setMenu(null);//para no seleccionar el mismo menu anterior

}

ipcMain.on('product:new', (e,newProduct)=>{
    mainWindows.webContents.send('product:new', newProduct);
    newProductWindow.close();
    //console.log(newProduct);
});


//menu customizado
const templateMenu = [
    {
        label: 'File',
        submenu: [
            {
                label: 'New Product',
                accelerator: 'Ctrl+N',
                click() {
                    createNewProductWindow();
                }
            },
            {
                label: 'Remove All Products',
                click() {
                    mainWindows.webContents.send('products:remove-all');
                }
            },
            {
                label: 'Exit App',
                accelerator: process.platform == 'darwin' ? 'command+S' : 'Ctrl+S',
                click() {
                    app.quit();
                }
            }
        ]
    }
];

if (process.platform === 'darwin') {
    templateMenu.unshift({
        label: app.getName()
    });
}

if(process.env.NODE_ENV!=='production'){
    templateMenu.push({
        label:'Dev Tools',
        submenu:[
            {
                label:'Show/HIde Dev Tools',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role:'reload'
            }
        ]
    })
}
