<template>
    <div class="main p-1 row flex-nowrap col-12" id="container">
        <div class="loader position-fixed col-12 text-center row flex-wrap align-items-center justify-content-center p-0 m-0" v-if="loading.show">
            <div>
                <img :src="loading.img">
                <div class="h4 col-12 text-center">
                    {{ loading.message }}
                </div>
            </div>
        </div>
        <div class="area row m-0 p-3 justify-content-center flex-nowrap">
            <div v-for="line in drawLines" class="line col-2 position-relative m-0 p-0" :key="line.id" 
                :id="line.id" :ref="line.id" :class="[line.class, {'accept': line.accept.includes(selected.key)}]"
                @click="addBlock" @dragover="allowDrop" @dragleave="leaveDrag" @drop="dropElement" :title="line.title"
                :style="{'height': `${height}px !important`}"
            >
                <drag-component v-for="drag in getDraggables(line.id)" :key="drag.id" :id="drag.id"
                    :src="drag.selected.src" :x="drag.x" :y="drag.y" @moving="moving" @contextmenu.prevent="removeBlock"
                ></drag-component>
            </div>
        </div>

        <div class="panel p-0 mx-4">
            <div class="col-12 row m-0 p-0 justify-content-start flex-wrap">
                <div class="h4 text-secondary text col-12 border-bottom border-secondary col-12">Blocos</div>
                <div class="col-4 p-0 m-0 position-relative" v-for="img in imgs" :key="img.key">
                    <img class="item col-12 p-0 m-0" :data-key="img.key"
                        :src="img.src" :title="img.title" role="button" @click="select(img)" 
                        :class="{'selected': selected.key == img.key}" draggable="draggable"
                        @drag.prevent="dragElement(img)"
                    />
                    <input type="file" @change="setBlockImage" accept="image/png" :data-image-key="img.key" :id="['choose' + img.key]" class="d-none" v-if="color == '0'">
                    <button class="btn btn-warning rounded position-absolute bottom-0 end-0" v-if="color == '0'" @click="chose('#choose' + img.key)">
                        <i class="fa fa-upload"></i>
                    </button>
                </div>

                <div class="h4 text-secondary text col-12 border-bottom border-secondary col-12">Portais</div>
                <img class="item col-4 p-0 m-0" v-for="img in portals" :key="img.key" :data-key="img.key"
                    :src="img.src" :title="img.title" role="button" @click="select(img)" 
                    :class="{'selected': selected.key == img.key}" draggable="draggable"
                    @drag="dragElement(img)"
                />

                <div class="h4 text-secondary text col-12 border-bottom border-secondary col-12">Velocidade</div>
                <img class="item col-4 p-0 m-0" v-for="img in speedOptions" :key="img.key" :data-key="img.key"
                    :src="img.src" :title="img.title" role="button" @click="select(img)" 
                    :class="{'selected': selected.key == img.key}" draggable="draggable"
                    @drag="dragElement(img)"
                />
            </div>
        </div>

        <div class="options">
            <div class="col-12 row m-0 p-0 justify-content-start flex-wrap">
                <div class="h4 text-secondary text col-12 border-bottom border-secondary col-12">Mais Opcoes</div>
                <div class="form-group p-1 col-12">
                    <label class="form-label col-12">Comprimento da area</label>
                    <input type="number" step="1" min="600" v-model="height" class="form-control">
                </div> 
                <div class="form-group p-1 col-12">
                    <label class="form-label col-12">Cor dos blocos</label>
                    <select class="form-control form-select" v-model="color" @change="getImages">
                        <option value="black">Preto</option>
                        <option value="blue">Azul</option>
                        <option value="green">Verde</option>
                        <option value="red">Vermelho</option>
                        <option value="0">Personalizar</option>
                    </select>
                </div>
                <div class="form-group p-1 col-12 position-relative">
                    <label class="form-label col-12">Imagem de fundo</label>
                    <img :src="background" class="background">
                    <input type="file" accept="image/png" id="back" class="d-none" @change="setBackImage">
                    <button class="btn btn-warning rounded position-absolute bottom-0 start-0" @click="chose('#back')">
                        <i class="fa fa-upload"></i>
                    </button>
                </div> 
                <div class="h4 text-secondary text col-12 border-bottom border-secondary col-12 pt-2">Meta Dados</div>
                <div class="form-group p-1 col-12" v-for="input in userMeta" :key="input.label">
                    <label class="form-label">{{ input.label }}</label>
                    <input :type="input.type" v-model="input.val" class="form-control">
                </div> 
                <div class="form-group p-1">
                    <button class="btn btn-lg btn-primary" @click="finish">
                        Baixar Nivel
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import DragComponent from './components/DragComponent.vue'
    import JSZip from 'jszip'
    // Imagens
    import PortalOpen from '@/assets/Images/level maker/portal open.png'
    import PortalClose from '@/assets/Images/level maker/portal close.png'
    import loadImg from '@/assets/Images/Level Maker ICO.png'
    import background from '@/assets/Images/background.png'

    export default {
        name: "App",
        components: {
            DragComponent
        },
        data() {
            return {
                selected: {},
                loading: {
                    show: false,
                    message: "",
                    img: loadImg
                },
                background: background,
                idCounter: 0,
                height: 600,
                color: "blue",
                imgs: [
                    {title: 'BLoco Normal', key: 'bn', name: 'Normal'},
                    {title: 'BLoco Fake', key: 'bf', name: 'Fake'},
                    {title: 'BLoco Quebravel', key: 'bq', name: 'Breakable'},
                ],
                userMeta: [
                    {label: "Seu nome", val: "", type: "text", key: "author"},
                    {label: "Titulo do Nivel", val: "", type: "text", key: "title"},
                ],
                drawLines: [
                    {id: 'b1', class: 'blocks border border-primary', accept: ['bn', 'bf', 'bq'], title: "Area de blocos"},
                    {id: 'b2', class: 'blocks border border-primary', accept: ['bn', 'bf', 'bq'], title: "Area de blocos"},
                    {id: 'b3', class: 'blocks border border-primary', accept: ['bn', 'bf', 'bq'], title: "Area de blocos"},
                    {id: 'divisor', class: 'div', accept: [],  title: ""},
                    {id: 'portals', class: 'portals border border-warning', accept: ['portal1', 'portal2'],  title: "Area de portais"},
                    {id: 'speed', class: 'speed border border-danger', accept: [],  title: "Area de velocidade"},
                ],
                portals: [
                    {src: PortalOpen, title: "Abrir", key: 'portal1', class: 'bg-success'},
                    {src: PortalClose, title: "Fechar", key: 'portal2', class: 'bg-danger'}
                ],
                speedOptions: [
                ],
                draggables: []
            }
        },
        created() {
            this.getImages()
            this.getSpeedOptions()
        },
        methods: {
            async getImages() {
                if (this.color == "0") {
                    // minhas imagens

                } else {
                    try {
                        // const blocks = ['Normal', 'Fake', 'Breakable']
                        for(let i of this.imgs) {
                            const img = await import(`@/assets/Images/${this.color.toUpperCase()}/${i.name}.png`)
                            i.src = img.default
                        }
                    } catch (e) {
                        // console.log(e)
                    }
                }
            },
            async getSpeedOptions() {
                try {
                    // const blocks = ['Normal', 'Fake', 'Breakable']
                    for(let i = 1; i <= 6; i++) {
                        const img = await import(`@/assets/Images/level maker/speed ${i}.png`)
                        this.speedOptions.push({
                            src: img.default,
                            key: `speed${i}`,
                            title: `velocidade ${i}`
                        })

                        this.drawLines[this.drawLines.length - 1].accept.push(`speed${i}`)
                    }
                } catch (e) {
                    // console.log(e)
                }
            },
            getDraggables(parent) {
                const arr = []
                for(const element of this.draggables) {
                    if (element.parent == parent) {
                        arr.push(element)
                    }
                }

                return arr
            },
            select(element) {
                this.selected = element
            },
            chose(selector) {
                this.$el.querySelector(selector).click()
            },
            async validatePng(src, w, h) {
                const loaded = new Image()
                loaded.src = src

                // Crie uma Promessa para carregar a imagem
                await new Promise((resolve, reject) => {
                    loaded.onload = () => resolve(loaded);
                    loaded.onerror = reject;
                });
                return loaded.width == w && loaded.height == h
            },
            async setBackImage(event) {
                if (event.target.files[0] && event.target.files[0].type == "image/png") {
                    const object = URL.createObjectURL(event.target.files[0])

                    if (!await this.validatePng(object, 300, 600)) {
                        alert("Erro:\n\nSelecione uma imagem com 300px X 600px")
                    } else {
                        this.background = object
                        console.log(object)
                    }

                } else {
                    alert("Erro:\n\nSelecione uma imagem .png")
                }
            },
            async setBlockImage(event) {
                if (event.target.files[0] && event.target.files[0].type == "image/png") {
                    const key = event.target.getAttribute("data-image-key")
                    const [img] = this.imgs.filter(item => item.key == key)
                    const object = URL.createObjectURL(event.target.files[0])

                    if (!await this.validatePng(object, 100, 100)) {
                        alert("Erro:\n\nSelecione uma imagem com 100px X 100px")
                    } else {
                        img.src = object
                    }

                } else {
                    alert("Erro:\n\nSelecione uma imagem .png")
                }
            },
            moving(dy, id) {
                const drag = this.draggables.filter(item => item.id == id)[0]
                drag.y = Number(drag.y) - Number(dy)
            },
            addBlock(event) {
                const id = event.target.getAttribute("id")
                this.idCounter++
                const draggable = {
                    x: 0, 
                    y: event.offsetY - 50, 
                    id: `drag${this.idCounter}`, 
                    parent: id,
                    key: null
                }

                if (id && this.selected.key && event.target.classList.contains('accept')) {
                    // pegar o src nas imagens
                    draggable.key = this.selected.key
                    draggable.selected = this.selected

                    this.draggables.push(draggable)
                }
            },
            removeBlock(event) {
                const id = event.target.getAttribute("id")
                const drag = this.draggables.findLastIndex(item => item.id == id)
                this.draggables.splice(drag, 1)
            },
            dragElement(element) {
                this.select(element)
            },
            allowDrop(event) {
                event.target.classList.add("hover")
                if (event.target.classList.contains('accept')) {
                    event.preventDefault()
                }
            },
            leaveDrag(event) {
                event.target.classList.remove("hover")
            },
            dropElement(event) {
                event.target.classList.remove("hover")
                this.addBlock(event)
            },
            order() {
                this.draggables.sort((a, b) => a.y - b.y)
            },
            async getImageBlob(img) {
                const response = await fetch(img);
                const blob = await response.blob();
                return blob;
            },
            async finish() {
                this.loading.show = true
                const lvl = {
                    meta: {},
                    objects: [],
                    generatedBy: "Mixage JS - Level Maker"
                }

                // colotar meta dados
                this.loading.message = "Coletando meta dados"
                this.userMeta.forEach(meta => {
                    lvl.meta[meta.key] = meta.val
                })

                if (lvl.meta.title == "" || !lvl.meta.title) {
                    lvl.meta.title = "Auto_generated_name_" + new Date().toLocaleString()
                }

                lvl.meta.title = lvl.meta.title.replaceAll("/", "-")
                lvl.meta.title = lvl.meta.title.replaceAll("\\", "-")

                // ordenar arrastaveis
                this.loading.message = "Ordenando objectos"
                this.order()

                // Coletando objectos
                this.loading.message = "Coletando objectos"
                let finish = true
                for(const draggable of this.draggables) {
                    if (draggable.y >= this.height) {
                        finish = true
                        this.loading.show = false
                        break
                    } else {
                        const lvlObject = {
                            y: draggable.y,
                            type: draggable.key,
                            pos: 0
                        }
                        if (['bn', 'bf', 'bq'].includes(lvlObject.type)) {
                            lvlObject.pos = {b1: 1, b2: 2, b3: 3}[draggable.parent]
                            if (!lvlObject.pos) {
                                this.loading.message = "Erro detectado",
                                this.loading.show = false
                                finish = false
                                alert("Posicao incorreta de bloco")
                                break
                            } else {
                                lvl.objects.push(lvlObject)
                            }
                        } else if (!['portal1', 'portal2'].concat(this.drawLines[this.drawLines.length - 1].accept).includes(lvlObject.type)) {
                            this.loading.message = "Erro detectado",
                            this.loading.show = false
                            finish = false
                            alert("Elemento nao recondecido detectado")
                            break
                        } else {
                            lvl.objects.push(lvlObject)
                        }
                    }
                }

                if (finish) {
                    const zip = new JSZip();
                    const folder = zip.folder('assets');
                    this.loading.message = "Gerando zip"

                    /** *  add lvl file */
                    let text = JSON.stringify(lvl, null, 4);
                    text = btoa(text);
                    const blob = new Blob([text], { type: 'text/plain' });
                    zip.file(lvl.meta.title + ".lvl", blob)

                    /** *  add images files */
                    for(const img of this.imgs) {
                        folder.file(img.name + ".png", await this.getImageBlob(img.src))
                    }

                    /** *  add back image file */
                    folder.file("back.png", await this.getImageBlob(this.background))

                    // create download link element
                    const zipBlob = await zip.generateAsync({ type: 'blob' });
                    const a = document.createElement("a")
                    a.setAttribute("download", lvl.meta.title + ".zip")
                    a.setAttribute("href", URL.createObjectURL(zipBlob))
                    a.setAttribute("target", "_blanck")
                    a.click()
                }
                this.loading.show = false
            }
        }
    }
</script>

<style lang="scss">

    #container {
        padding: 0px !important;
        margin: 0px;
        .loader {
            z-index: 2;
            width: 100vw;
            height: 100vh;
            left: 0;
            top: 0;
            background: rgb(100, 100, 100, 0.6);

            img {
                width: 100px;
                height: 100px;
                animation: spin 2s ease-in-out .1s infinite;
            }
        }

        .area {
            width: 600px;
            height: 600px;
            overflow-y: scroll;

            .line {
                position: relative !important;
                transform: rotate(180deg);
                &:hover, &.hover {
                    cursor: not-allowed;
                    background: #d47b7b;
                }

                &.accept {
                    border-style: dashed !important;
                    cursor: pointer;
                    &:hover, &.hover {
                        background: #a5fba5;
                    }
                }

                .draggable {
                    height: 90px;
                    width: 90px;
                    position: absolute;
                }
            }
        }

        .panel {
            width: 300px;
            height: auto;

            .row {
                .text {
                    height: auto;
                    width: 300px;
                }

                .item {
                    height: 100px;
                    cursor:grab;
                    &:hover {
                        transform: scale(0.86);
                    }

                    &.selected {
                        border: 1px solid #5645fa;
                    }
                }
            }
        }

        .options {
            width: 300px;
            max-height: 100vh;
            overflow-y: auto;
            .background {
                width: 100px;
                height: 200px;
            }
        }
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
