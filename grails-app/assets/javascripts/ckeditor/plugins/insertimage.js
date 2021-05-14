/**
 * Custom CKEditor control to allow images to be uploaded to the profile and/or selected to display inside the attribute.
 * This plugin is inspired form ckeditor's Image plugin.
 * InsertImage plugin creates different content for editing and data views. For editing view, it creates the below format.
 * <div class="..."><img src="https://..." alt="..." class="..."/></div>
 * Wrapping img in a div is needed for nicer rendering on editing view. It also means it can be converted to a widget.
 * This enables capabilities like inline toolbar, type around etc.
 * For data view, it creates the below content. This content is saved to the database.
 * <img src="https://..." alt="..." class="..."/>
 */
import Plugin from '../../../thirdparty/ckeditor5/node_modules/@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '../../../thirdparty/ckeditor5/node_modules/@ckeditor/ckeditor5-ui/src/button/buttonview';
import imageIcon from '../../../thirdparty/ckeditor5/node_modules/@ckeditor/ckeditor5-core/theme/icons/image.svg';
import {toWidget} from '../../../thirdparty/ckeditor5/node_modules/@ckeditor/ckeditor5-widget/src/utils';

export default class InsertImage extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'InsertImage';
    }

    init() {
        const editor = this.editor;
        const t = editor.t;

        editor.ui.componentFactory.add('insertImage', locale => {
            const view = new ButtonView(locale);

            view.set({
                label: 'Insert image',
                icon: imageIcon,
                tooltip: true
            });

            // Callback executed once the image is clicked.
            view.on('execute', () => {
                editor.fire('insertimage', {
                    callback: function (image) {
                        editor.model.change(writer => {
                            const imageElement = writer.createElement('image', {
                                "src": image.url,
                                "alt": image.title,
                                "class": image.class,
                                "position": image.position
                            });

                            // Insert the image in the current selection location.
                            editor.model.insertContent(imageElement, editor.model.document.selection);
                        });
                    }
                });
            });

            editor.model.schema.register('image', {
                isObject: true,
                isBlock: true,
                isInline: false,
                allowWhere: '$block',
                allowAttributes: ['alt', 'src', 'class', 'position']
            });

            // Data view has a separate conversion mechanism compared to editing view. ckeditor keeps them separate.
            // This separation allows adding inline toolbar to image and other nice feaures. In this plugin,
            // img tag is wrapped in a div on editing view. But in data model it just img tag only. This is done so that
            // it does not break existing HTML code.
            editor.conversion.for('dataDowncast').elementToElement({
                model: 'image',
                view: (modelElement, {writer}) => createImageViewElement(writer, false)
            })
                .add(modelToDataViewAttributeConverter('src'))
                .add(modelToDataViewAttributeConverter('alt'))
                .add(modelToDataViewAttributeConverter('class'));

            editor.conversion.for('editingDowncast').elementToElement({
                model: 'image',
                view: (modelElement, {writer}) => toImageWidget(createImageViewElement(writer, true), writer, t('image widget'))
            })
                .add(modelToEditingViewAttributeConverter('src'))
                .add(modelToEditingViewAttributeConverter('alt'))
                .add(modelToEditingViewAttributeConverter('class'))
                .add(modelToEditingViewAttributeConverter('position'));

            editor.conversion.for('upcast')
                .elementToElement({
                    view: {
                        name: 'img',
                        attributes: {
                            src: true,
                            alt: true,
                            class: true
                        }
                    },
                    model: (viewImage, {writer}) => writer.createElement('image', {
                        src: viewImage.getAttribute('src'),
                        alt: viewImage.getAttribute('alt'),
                        class: viewImage.getAttribute('class'),
                        position: viewImage.hasClass('pull-right') ? 'pull-right' : 'pull-left'
                    })
                });

            return view;
        });
    }
}

export function modelToDataViewAttributeConverter(attributeKey) {
    return dispatcher => {
        dispatcher.on(`attribute:${attributeKey}:image`, converter);
    };

    function converter(evt, data, conversionApi) {
        if (!conversionApi.consumable.consume(data.item, evt.name)) {
            return;
        }

        const viewWriter = conversionApi.writer;
        let img = conversionApi.mapper.toViewElement(data.item)
        viewWriter.setAttribute(data.attributeKey, data.attributeNewValue || '', img);
    }
}

export function modelToEditingViewAttributeConverter(attributeKey) {
    return dispatcher => {
        dispatcher.on(`attribute:${attributeKey}:image`, converter);
    };

    function converter(evt, data, conversionApi) {
        if (!conversionApi.consumable.consume(data.item, evt.name)) {
            return;
        }

        const viewWriter = conversionApi.writer;
        let div = conversionApi.mapper.toViewElement(data.item);
        let img = getViewImgFromWidget(div);
        switch (attributeKey) {
            case "position":
                div._addClass(data.attributeNewValue);
                // viewWriter.setAttribute( 'class', (div.class || '') + " " + 'image-style-side', div );
                break;
            default:
                viewWriter.setAttribute(data.attributeKey, data.attributeNewValue || '', img);
                break;
        }
    }
}

export function createImageViewElement(writer, addWrapper) {
    if (addWrapper) {
        const emptyElement = writer.createEmptyElement('img');
        const div = writer.createContainerElement('div', {class: 'image'});
        writer.insert(writer.createPositionAt(div, 0), emptyElement);

        return div;
    } else {
        return writer.createEmptyElement('img');
    }
}

export function toImageWidget(viewElement, writer, label) {
    writer.setCustomProperty('image', true, viewElement);

    return toWidget(viewElement, writer, {label: labelCreator});

    function labelCreator() {
        const altText = viewElement.getAttribute('alt');

        return altText ? `${altText} ${label}` : label;
    }
}

export function getViewImgFromWidget(divElement) {
    const divChildren = [];

    for (const divChild of divElement.getChildren()) {
        divChildren.push(divChild);

        if (divChild.is('element')) {
            divChildren.push(...divChild.getChildren());
        }
    }

    return divChildren.find(viewChild => viewChild.is('element', 'img'));
}
