(function (window) {
    const CLASS = {
        ROW_CONTAINER: "sb-row",
        COL_CONTAINER: "sb-col",
        ITEM: "sb__item",
        ITEM_RESIZING: "sb__item--resizing",
        SASH: "sb__sash",
        SASH_DRAGGING: "sb__sash--dragging",
    };

    const fn = {
        getIndex(sash) {
            return Number(sash.dataset.index);
        },
        getPrev(sash) {
            let currentIndex = fn.getIndex.bind(this)(sash);
            return currentIndex == 0 ? null : this.sashes[currentIndex - 1];
        },
        getNext(sash) {
            let currentIndex = fn.getIndex.bind(this)(sash);
            return currentIndex == this.sashes.length - 1 ? null : this.sashes[currentIndex + 1];
        },
        getLeft(sash) {
            return Number(sash.style.left.split("px")[0]);
        },
        setLeft(sash, left) {
            sash.style.left = `${Math.round(left)}px`;
            fn.updateChildrenAround.bind(this)(sash);
            this._emit({ type: "resize" });
        },
        getTop(sash) {
            return Number(sash.style.top.split("px")[0]);
        },
        setTop(sash, top) {
            sash.style.top = `${Math.round(top)}px`;
            fn.updateChildrenAround.bind(this)(sash);
            this._emit({ type: "resize" });
        },
        initRowLayout(el) {
            this.minWidth = 0;
            for (let i = 0; i < this.cfg.items.length; i++) {
                this.minWidth += this.cfg.items[i].minWidth;
                el.children[i > 0 ? 2 * i - 1 : i].classList.add(CLASS.ITEM);
                el.children[i > 0 ? 2 * i - 1 : i].style.minWidth = `${this.cfg.items[i].minWidth}px`;
                el.children[i > 0 ? 2 * i - 1 : i].style.width = `${Math.round(
                    this.cfg.items[i].initialProportion * this.el.getBoundingClientRect().width
                )}px`;
                this.items.push(el.children[i > 0 ? 2 * i - 1 : i]);
                if (i > 0) {
                    // children changes dynamically with insertion (current child index: 2 * i - 1)
                    const sash = document.createElement("div");
                    sash.dataset.index = i - 1;
                    sash.classList.add(CLASS.SASH);
                    let left = 0;
                    for (let j = 0; j < 2 * i - 1; j += 2) {
                        left += el.children[j].getBoundingClientRect().width;
                    }
                    sash.style.left = `${left}px`;
                    el.insertBefore(sash, el.children[2 * i - 1]);
                    this.sashes.push(sash);
                }
            }
            el.style.minWidth = `${this.minWidth}px`;
        },
        initColLayout(el) {
            this.minHeight = 0;
            for (let i = 0; i < this.cfg.items.length; i++) {
                this.minHeight += this.cfg.items[i].minHeight;
                el.children[i > 0 ? 2 * i - 1 : i].classList.add(CLASS.ITEM);
                el.children[i > 0 ? 2 * i - 1 : i].style.minHeight = `${this.cfg.items[i].minHeight}px`;
                el.children[i > 0 ? 2 * i - 1 : i].style.height = `${Math.round(
                    this.cfg.items[i].initialProportion * this.el.getBoundingClientRect().height
                )}px`;
                this.items.push(el.children[i > 0 ? 2 * i - 1 : i]);
                if (i > 0) {
                    // children changes dynamically with insertion (current child index: 2 * i - 1)
                    const sash = document.createElement("div");
                    sash.dataset.index = i - 1;
                    sash.classList.add(CLASS.SASH);
                    let top = 0;
                    for (let j = 0; j < 2 * i - 1; j += 2) {
                        top += el.children[j].getBoundingClientRect().height;
                    }
                    sash.style.top = `${top}px`;
                    el.insertBefore(sash, el.children[2 * i - 1]);
                    this.sashes.push(sash);
                }
            }
            el.style.minHeight = `${this.minHeight}px`;
        },
        adjustRowLayout(sash, x) {
            if (sash != null) {
                const index = fn.getIndex(sash);
                if (index == 0) {
                    const distanceToLeftBound = x;
                    const distanceToRightBound =
                        this.sashes.length == 1
                            ? this.el.getBoundingClientRect().width - x
                            : fn.getLeft(fn.getNext.bind(this)(sash)) - x;
                    if (distanceToLeftBound < this.cfg.items[index].minWidth) {
                        fn.setLeft.bind(this)(sash, this.cfg.items[index].minWidth);
                    } else if (distanceToRightBound < this.cfg.items[index + 1].minWidth) {
                        fn.adjustRowLayout.bind(this)(
                            fn.getNext.bind(this)(sash),
                            x + this.cfg.items[index + 1].minWidth
                        );
                        fn.setLeft.bind(this)(sash, distanceToRightBound + x - this.cfg.items[index + 1].minWidth);
                    } else {
                        fn.setLeft.bind(this)(sash, x);
                    }
                } else if (index == this.sashes.length - 1) {
                    const distanceToLeftBound =
                        this.sashes.length == 1 ? x : x - fn.getLeft(fn.getPrev.bind(this)(sash));
                    const distanceToRightBound = this.el.getBoundingClientRect().width - x;
                    if (distanceToLeftBound < this.cfg.items[index].minWidth) {
                        fn.adjustRowLayout.bind(this)(fn.getPrev.bind(this)(sash), x - this.cfg.items[index].minWidth);
                        fn.setLeft.bind(this)(
                            sash,
                            fn.getLeft(fn.getPrev.bind(this)(sash)) + this.cfg.items[index].minWidth
                        );
                    } else if (distanceToRightBound < this.cfg.items[index + 1].minWidth) {
                        fn.setLeft.bind(this)(
                            sash,
                            this.el.getBoundingClientRect().width - this.cfg.items[index + 1].minWidth
                        );
                    } else {
                        fn.setLeft.bind(this)(sash, x);
                    }
                } else {
                    const distanceToLeftBound = x - fn.getLeft(fn.getPrev.bind(this)(sash));
                    const distanceToRightBound = fn.getLeft(fn.getNext.bind(this)(sash)) - x;
                    if (distanceToLeftBound < this.cfg.items[index].minWidth) {
                        fn.adjustRowLayout.bind(this)(fn.getPrev.bind(this)(sash), x - this.cfg.items[index].minWidth);
                        fn.setLeft.bind(this)(
                            sash,
                            fn.getLeft(fn.getPrev.bind(this)(sash)) + this.cfg.items[index].minWidth
                        );
                    } else if (distanceToRightBound < this.cfg.items[index + 1].minWidth) {
                        fn.adjustRowLayout.bind(this)(
                            fn.getNext.bind(this)(sash),
                            x + this.cfg.items[index + 1].minWidth
                        );
                        fn.setLeft.bind(this)(
                            sash,
                            fn.getLeft(fn.getNext.bind(this)(sash)) - this.cfg.items[index + 1].minWidth
                        );
                    } else {
                        fn.setLeft.bind(this)(sash, x);
                    }
                }
            }
        },
        adjustColLayout(sash, y) {
            if (sash != null) {
                const index = fn.getIndex(sash);
                if (index == 0) {
                    const distanceToTopBound = y;
                    const distanceToBottomBound =
                        this.sashes.length == 1
                            ? this.el.getBoundingClientRect().height - y
                            : fn.getTop(fn.getNext.bind(this)(sash)) - y;
                    if (distanceToTopBound < this.cfg.items[index].minHeight) {
                        fn.setTop.bind(this)(sash, this.cfg.items[index].minHeight);
                    } else if (distanceToBottomBound < this.cfg.items[index + 1].minHeight) {
                        fn.adjustColLayout.bind(this)(
                            fn.getNext.bind(this)(sash),
                            y + this.cfg.items[index + 1].minHeight
                        );
                        fn.setTop.bind(this)(sash, distanceToBottomBound + y - this.cfg.items[index + 1].minHeight);
                    } else {
                        fn.setTop.bind(this)(sash, y);
                    }
                } else if (index == this.sashes.length - 1) {
                    const distanceToTopBound = this.sashes.length == 1 ? y : y - fn.getTop(fn.getPrev.bind(this)(sash));
                    const distanceToBottomBound = this.el.getBoundingClientRect().height - y;
                    if (distanceToTopBound < this.cfg.items[index].minHeight) {
                        fn.adjustColLayout.bind(this)(fn.getPrev.bind(this)(sash), y - this.cfg.items[index].minHeight);
                        fn.setTop.bind(this)(
                            sash,
                            fn.getTop(fn.getPrev.bind(this)(sash)) + this.cfg.items[index].minHeight
                        );
                    } else if (distanceToBottomBound < this.cfg.items[index + 1].minHeight) {
                        fn.setTop.bind(this)(
                            sash,
                            this.el.getBoundingClientRect().height - this.cfg.items[index + 1].minHeight
                        );
                    } else {
                        fn.setTop.bind(this)(sash, y);
                    }
                } else {
                    const distanceToTopBound = y - fn.getTop(fn.getPrev.bind(this)(sash));
                    const distanceToBottomBound = fn.getTop(fn.getNext.bind(this)(sash)) - y;
                    if (distanceToTopBound < this.cfg.items[index].minHeight) {
                        fn.adjustColLayout.bind(this)(fn.getPrev.bind(this)(sash), y - this.cfg.items[index].minHeight);
                        fn.setTop.bind(this)(
                            sash,
                            fn.getTop(fn.getPrev.bind(this)(sash)) + this.cfg.items[index].minHeight
                        );
                    } else if (distanceToBottomBound < this.cfg.items[index + 1].minHeight) {
                        fn.adjustColLayout.bind(this)(
                            fn.getNext.bind(this)(sash),
                            y + this.cfg.items[index + 1].minHeight
                        );
                        fn.setTop.bind(this)(
                            sash,
                            fn.getTop(fn.getNext.bind(this)(sash)) - this.cfg.items[index + 1].minHeight
                        );
                    } else {
                        fn.setTop.bind(this)(sash, y);
                    }
                }
            }
        },
        updateChildrenAround(sash) {
            const index = fn.getIndex(sash);
            if (this.cfg.direction == "row") {
                const prevLeft = index == 0 ? 0 : fn.getLeft(fn.getPrev.bind(this)(sash));
                const currentLeft = fn.getLeft(sash);
                const nextLeft =
                    index == this.sashes.length - 1
                        ? this.el.getBoundingClientRect().width
                        : fn.getLeft(fn.getNext.bind(this)(sash));
                this.items[index].style.width = `${currentLeft - prevLeft}px`;
                this.items[index + 1].style.width = `${Math.round(nextLeft - currentLeft)}px`;
            } else if (this.cfg.direction == "col") {
                const prevTop = index == 0 ? 0 : fn.getTop(fn.getPrev.bind(this)(sash));
                const currentTop = fn.getTop(sash);
                const nextTop =
                    index == this.sashes.length - 1
                        ? this.el.getBoundingClientRect().height
                        : fn.getTop(fn.getNext.bind(this)(sash));
                this.items[index].style.height = `${currentTop - prevTop}px`;
                this.items[index + 1].style.height = `${Math.round(nextTop - currentTop)}px`;
            }
        },
    };

    const hdlr = {
        SashMouseDown: function (evt) {
            if (evt.target.classList.contains(CLASS.SASH) && evt.target.parentNode == this.el) {
                evt.target.classList.add(CLASS.SASH_DRAGGING);
                for (let i = 0; i < this.items.length; i++) {
                    this.items[i].classList.add(CLASS.ITEM_RESIZING);
                }
            }
        },
        WindowMouseUp: function () {
            const draggingSash = this.el.querySelector(`.${CLASS.SASH}.${CLASS.SASH_DRAGGING}`);
            if (draggingSash != null && draggingSash.parentNode == this.el) {
                draggingSash.classList.remove(CLASS.SASH_DRAGGING);
                for (let i = 0; i < this.items.length; i++) {
                    this.items[i].classList.remove(CLASS.ITEM_RESIZING);
                }
            }
        },
        WindowMouseMove: function (evt) {
            const draggingSash = this.el.querySelector(`.${CLASS.SASH}.${CLASS.SASH_DRAGGING}`);
            if (draggingSash != null && draggingSash.parentNode == this.el) {
                if (this.cfg.direction == "row") {
                    fn.adjustRowLayout.bind(this)(draggingSash, evt.clientX - this.el.getBoundingClientRect().left);
                } else if (this.cfg.direction == "col") {
                    fn.adjustColLayout.bind(this)(draggingSash, evt.clientY - this.el.getBoundingClientRect().top);
                }
            }
        },
        WindowResize: function () {
            const BCR = this.el.getBoundingClientRect();
            const lastSash = this.sashes[this.sashes.length - 1];
            const lastItemInCfg = this.cfg.items[this.cfg.items.length - 1];
            if (this.cfg.direction == "row") {
                if (BCR.width - fn.getLeft(lastSash) < lastItemInCfg.minWidth) {
                    fn.adjustRowLayout.bind(this)(lastSash, BCR.width - lastItemInCfg.minWidth);
                } else {
                    fn.adjustRowLayout.bind(this)(lastSash, fn.getLeft(lastSash));
                }
            } else if (this.cfg.direction == "col") {
                if (BCR.height - fn.getTop(lastSash) < lastItemInCfg.minHeight) {
                    fn.adjustColLayout.bind(this)(lastSash, BCR.height - lastItemInCfg.minHeight);
                } else {
                    fn.adjustColLayout.bind(this)(lastSash, fn.getTop(lastSash));
                }
            }
        },
    };

    class StrechBox {
        constructor(el, cfg = {}) {
            this.el = el;
            this.cfg = {
                direction: "row",
            };
            this.sashes = [];
            this.items = [];
            this._listeners = {};
            // setup
            Object.assign(this.cfg, cfg);
            if (this.cfg.items == undefined) {
                this.cfg.items = [];
                if (this.cfg.direction == "row") {
                    for (let i = 0; i < el.children.length; i++) {
                        this.cfg.items.push({
                            initialProportion: 1 / el.children.length,
                            minWidth: 100,
                        });
                    }
                } else if (this.cfg.direction == "col") {
                    for (let i = 0; i < el.children.length; i++) {
                        this.cfg.items.push({
                            initialProportion: 1 / el.children.length,
                            minHeight: 100,
                        });
                    }
                }
            }
            // render
            if (this.cfg.direction == "row") {
                this.el.classList.add("sb-row");
                fn.initRowLayout.bind(this)(this.el);
            } else if (this.cfg.direction == "col") {
                this.el.classList.add("sb-col");
                fn.initColLayout.bind(this)(this.el);
            }
            // install event handlers
            window.addEventListener("mousedown", hdlr.SashMouseDown.bind(this));
            window.addEventListener("mouseup", hdlr.WindowMouseUp.bind(this));
            window.addEventListener("mousemove", hdlr.WindowMouseMove.bind(this));
            window.addEventListener("resize", hdlr.WindowResize.bind(this));
        }

        _emit(evt) {
            if (!(evt.type in this._listeners)) {
                return;
            }
            let stack = this._listeners[evt.type];
            for (let i = 0; i < stack.length; i++) {
                stack[i].call(this, evt);
            }
        }

        on(type, callback) {
            if (!(type in this._listeners)) {
                this._listeners[type] = [];
            }
            this._listeners[type].push(callback);
        }

        off(type, callback) {
            if (!(type in this._listeners)) {
                return;
            }
            let stack = this._listeners[type];
            for (let i = 0; i < stack.length; i++) {
                if (stack[i] === callback) {
                    stack.splice(i, 1);
                    return this.off(type, callback);
                }
            }
        }

        resize() {
            hdlr.WindowResize.bind(this)();
        }
    }
    window.StrechBox = StrechBox;
})(window);
