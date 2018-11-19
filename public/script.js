(function() {
    Vue.component("modal", {
        data: function() {
            return {
                image: {
                    title: "",
                    description: "",
                    username: "",
                    url: "",
                    created_at: ""
                },
                comments: [],
                comment: "",
                commentator: "",
                created_at: ""
            };
        },
        props: ["imageId"],
        template: "#modal", //here könnte auch einfach das html stehen in quotes
        mounted: function() {
            console.log("component modal has mounted");
            var self = this;
            axios
                .get("/modal/" + this.imageId)
                .then(result => {
                    console.log("RESULT OF MOUNTED COMPONENT", result);
                    console.log("RESULT.DATA: ", result.data);
                    if (!result.data.result) {
                        self.$emit("close2");
                    }
                    self.image = result.data.result;
                    self.comments = result.data.data;
                })
                .catch(function(err) {
                    console.log("ERROR IN MOUNTED :", err.message);
                });
        },
        watch: {
            imageId: function() {
                console.log("watching imageId");
                var self = this;
                axios
                    .get("/modal/" + this.imageId)
                    .then(result => {
                        console.log("RESULT OF MOUNTED COMPONENT", result);
                        if (!result.data.result) {
                            self.$emit("close2");
                        }
                        self.image = result.data.result;
                        self.comments = result.data.data;
                    })
                    .catch(function(err) {
                        console.log("ERROR IN MOUNTED :", err.message);
                    });
            }
        },
        methods: {
            uploadcomment: function() {
                // itself.comment = comment;
                // itself.username = commentator;
                // console.log("COMMENT: ", comment);

                var itself = this;
                axios
                    .post("/comment/" + this.imageId, {
                        comment: this.comment,
                        username: this.commentator
                    })
                    .then(function(response) {
                        itself.comments.unshift(response.data);
                        itself.commentator = "";
                        itself.comment = "";
                    })
                    .catch(function(err) {
                        console.log(
                            "ERROR IN UPLOAD COMMENT METHOD :",
                            err.message
                        );
                    });
            },
            close1: function() {
                this.$emit("close2");
            },
            deleteimage: function() {
                var its = this;
                axios
                    .post("/delete/" + this.imageId)
                    .then(function() {
                        console.log("this.id:", this.imageId);
                        its.$emit("delete");
                        location.hash = "";
                    })
                    .catch(function(err) {
                        console.log("ERROR in delete image:", err.message);
                    });
            }
        }
    });

    new Vue({
        el: "#main",

        data: {
            heading: "form/vue",

            images: [],
            title: "",
            desc: "",
            file: "",
            username: "",
            created_at: "",
            hasMore: true,
            imageId: location.hash.slice(1)
        },
        mounted: function() {
            console.log("mounted");
            var self = this;
            addEventListener("hashchange", function() {
                console.log("LOCATION.HASH :", location.hash);
                self.imageId = location.hash.slice(1);
            });
            axios
                .get("/image")
                .then(function(response) {
                    console.log("RESPONSE.DATA :", response.data);
                    self.images = response.data;
                })
                .catch(function(err) {
                    console.log("ERROR IN AXIOS :", err.message);
                });
        },

        methods: {
            makeModalAppear: function(id) {
                console.log("clicked on image with id ", id);
                this.imageId = id;
                console.log(this.imageId);
            },
            handleFileChange: function(e) {
                console.log("e.target.file[0] :", e.target.files[0]);
                this.file = e.target.files[0];
            },
            close3: function() {
                // this.imageId = null;
                location.hash = "";
            },
            upload: function() {
                var formData = new FormData();
                formData.append("title", this.title);
                formData.append("desc", this.desc);
                formData.append("username", this.username);
                formData.append("file", this.file);

                var me = this;
                axios
                    .post("/upload", formData)
                    .then(function(response) {
                        me.images.unshift(response.data[0]);
                        me.title = "";
                        me.desc = "";
                        me.username = "";
                    })
                    .catch(function(err) {
                        console.log("ERROR IN UPLOAD :", err.message);
                    });
            },
            reload: function() {
                var self = this;
                addEventListener("hashchange", function() {
                    console.log("LOCATION.HASH :", location.hash);
                    self.imageId = location.hash.slice(1);
                });
                axios
                    .get("/image")
                    .then(function(response) {
                        console.log("RESPONSE.DATA reload :", response.data);
                        self.images = response.data;
                    })
                    .catch(function(err) {
                        console.log("ERROR IN AXIOS :", err.message);
                    });
            },
            getmore: function() {
                var instance = this;
                axios
                    .get(
                        "/image/more/" +
                            instance.images[instance.images.length - 1].id
                    )
                    .then(function(response) {
                        console.log("*******RESPONSE :", response);
                        instance.images.push.apply(
                            instance.images,
                            response.data
                        );
                        if (
                            instance.images[instance.images.length - 1].id == 1
                        ) {
                            instance.hasMore = false;
                        }
                    })
                    .catch(function(err) {
                        console.log("ERROR GET MORE METHOD :", err.message);
                    });
            }
        }
    });
})();

window.onscroll = function() {
    myFunction();
};

var input = document.getElementById("input");
var sticky = input.offsetTop;

function myFunction() {
    if (window.pageYOffset > sticky) {
        input.classList.add("fixed-search");
    } else {
        input.classList.remove("fixed-search");
    }
}
