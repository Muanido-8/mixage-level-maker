<template>
    <img 
        :src="src" 
        ref="draggable" 
        class="draggable p-0 m-0"
        :style="{transform: `translate(${x}px, ${y}px) rotate(-180deg)`}"
        :id="id"
    >
</template>
<script>
    import interact from 'interactjs';

    export default {
        name: "DragComponent",
        props: {
            src: String,
            x: Number,
            y: Number,
            id: String
        },
        emits: ['moving'],
        mounted() {
            this.init()
        },
        methods: {
            init() {
                interact(this.$refs.draggable).draggable({
                    modifiers: [
                        interact.modifiers.restrictRect({
                            restriction: 'parent',
                            endOnly: true,
                        }),
                    ],
                    onmove: event => {
                        this.$emit('moving', Number(event.dy), this.id)
                    },
                })
            },
        }
    }
</script>

<style lang="scss">

</style>