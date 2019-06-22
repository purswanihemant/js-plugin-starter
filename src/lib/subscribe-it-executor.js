export class SubscribeItExecutor {
    variantsByTitle;
    variantsById;

    constructor($) {
        this.$ = $;
        this.product = _SIConfig.product;
        this.variants = _SIConfig.product.variants || [];
        this.settings = {};
    }

    execute() {
        if (!this.isProductPage()) {
            return;
        }

        this.initializeButton();
    }

    processProductVariants(product) {
        let index, variantsSize, variants, variant, variantObj;
        variants = product.variants
        variantsSize = variants.length;
        for (index = 0; index < variantsSize; index++) {
            variant = variants[index];
            this.variantsByTitle[variant.title] = this.$.extend({}, variant);
            this.variantsById[variant.id] = this.$.extend({}, variant);
        }


        let self = this;
        this.variants = function () {
            let index, variantsSize, variants, variantsResult;
            variantsResult = [];
            variants = this.product.variants;
            variantsSize = variants.length;

            for (index = 0; index < variantsSize; index++) {
                variantObj = variants[index];
                if (self.variantIsUnavailable(variantObj)) {
                    variantsResult.push(variantObj);
                }
            }
            return variantsResult
        }
            .call(this);

        if (true === this.settings.ignoreDuplicateSKUs) {
            this.variants = this.filterDuplicateSKUs(this.variants);
        }

        return this.variants;
    }


    //TODO
    filterDuplicateSKUs(variants) {

        let index, variantsSize, filteredVariants, map, isNotDuplicate, variant;
        filteredVariants = [];
        map = {};

        isNotDuplicate = function (sku, variant) {
            let variantSku = variant.sku;


            if (variantSku != null) {
                return variantSku.length === 0 || null == map[sku] && ((map[sku] = 1) && true)
            } else {
                return null == map[sku] && ((map[sku] = 1) && true)
            }
        };


        for (index = 0, variantsSize = variants.length; index < variantsSize; index++) {
            variant = variants[index];
            if (isNotDuplicate(variant.sku, variant)) {
                filteredVariants.push(variant);
            }
        }
        return filteredVariants
    };


    variantIsUnavailable(variant) {
        if (this.variantSoldOut(variant) && this.variantMeetsInventoryManagementPolicy(variant) && this.variantMeetsPreorderPolicy(variant)) {
            if (this.settings.hideForProductTag != null && this.product.tags != null) {
                if (this.product.tags.indexOf(this.settings.hideForProductTag) > -1) {
                    return true;
                }
            }
        }

        return false;
    }

    variantMeetsInventoryManagementPolicy(variant) {
        return !!this.settings.acceptUnmanagedInventory || variant.inventory_management && variant.inventory_management.length > 0
    }

    static productDataURL() {
        return "//" + window.location.hostname + "/products/" + SubscribeItExecutor.parseProductHandleFromURL() + ".js"
    }

    static parseProductHandleFromURL() {
        const urlPattern = /\/products\/([a-zA-Z0-9_\-]{0,}[a-zA-Z0-9_])\/?/;
        const regExpMatchArray = window.location.pathname.match(urlPattern);

        if (regExpMatchArray != null) {
            return regExpMatchArray[1];
        }

        return null;
    }

    initializeButton() {
        $(document).ready(function () {

            const link = $('<button>', {
                text: 'Hello World',
                css: {
                    width: '100%',
                },
                class: 'btn',
                href: '#',
                id: 'SI_trigger'
            }).wrap(
                $('<div>', {
                    css: {
                        margin: '0 4px',
                        flexBasis: '100%'
                    }
                })
            ).parent().hide();


            $('form[action="/cart/add"]').append(link);
        });
    }

    isProductPage() {
        return true;
    }


    variantSoldOut(variant) {

        if (this.settings.instock_qty_level !== 1 && this.settings.preorder_enabled === false) {
            console.log("Warning: Show for preorder is off: ignoring custom instock_qty_level setting.")
        }

        if (variant.inventory_quantity != null) {
            return variant.inventory_quantity < this.settings.instock_qty_level
        } else {
            if (this.settings.preorder_enabled) {
                console.log("Warning: inventory_quantity not available but show for preorder is enabled.")
            }

            if (this.settings.instock_qty_level !== 1) {
                console.log("Warning: instock_qty_level is set but inventory_quantity not available.");
            }

            return !variant.available;
        }
    }

    variantMeetsPreorderPolicy(variant) {
        return !!this.settings.preorder_enabled || false === variant.available;
    }
}