/**
 * Custom CKEditor control to allow images to be uploaded to the profile and/or selected to display inside the attribute
 */
import Plugin from '../../../../thirdparty/ckeditor5/node_modules/@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '../../../../thirdparty/ckeditor5/node_modules/@ckeditor/ckeditor5-ui/src/button/buttonview';
import HtmlDataProcessor from '../../../../thirdparty/ckeditor5/node_modules/@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import imageIcon from '../../../../thirdparty/ckeditor5/node_modules/@ckeditor/ckeditor5-core/theme/icons/image.svg';

export default class InsertImage extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'InsertImage';
    }

    init() {
        const editor = this.editor;

        editor.ui.componentFactory.add( 'insertImage', locale => {
            const view = new ButtonView( locale );

            view.set( {
                label: 'Insert image',
                icon: imageIcon,
                tooltip: true
            } );

            // Callback executed once the image is clicked.
            view.on( 'execute', () => {
                editor.fire('insertimage', { callback:function (image) {
                        editor.model.change( writer => {
                            // const imageElement = writer.createElement( 'image', {
                            //     src: imageUrl,
                            //     alt: altText
                            // } );
                            //
                            // // Insert the image in the current selection location.
                            // editor.model.insertContent( imageElement, editor.model.document.selection );

                            // const htmlDP = new HtmlDataProcessor( viewDocument );
                            const viewFragment = editor.data.processor.toView( image );
                            const modelFragment = editor.data.toModel( viewFragment );

                            editor.model.insertContent( modelFragment );
                    });
                } });
            } );

            editor.model.schema.register( 'image', {
                isObject: true,
                isBlock: true,
                isSelectable: true,
                allowWhere: '$block',
                allowAttributes: [ 'alt', 'src', 'class' ]
            } );

            // editor.conversion.for( 'downcast' ).elementToElement( {
            //     model: 'image',
            //     view: 'img'
            // } );

            // editor.conversion.for( 'editingDowncast' ).elementToElement( {
            //     model: 'image',
            //     view:  'img'
            // } );


            editor.conversion.for( 'downcast' ).elementToElement( {
                model: 'image',
                view: 'img'
            } )
                .add( modelToViewAttributeConverter( 'src' ) )
                .add( modelToViewAttributeConverter( 'alt' ) )
                .add( modelToViewAttributeConverter( 'class' ) );

            editor.conversion.for( 'upcast' )
                .elementToElement( {
                    view: {
                        name: 'img',
                        attributes: {
                            src: true,
                            alt: true,
                            class: true
                        }
                    },
                    model: ( viewImage, { writer } ) => writer.createElement( 'image', {
                        src: viewImage.getAttribute( 'src' ),
                        alt: viewImage.getAttribute( 'alt' ),
                        class: viewImage.getAttribute( 'class' )
                    } )
                } );

            return view;
        } );
    }
}

export function modelToViewAttributeConverter( attributeKey ) {
    return dispatcher => {
        dispatcher.on( `attribute:${ attributeKey }:image`, converter );
    };

    function converter( evt, data, conversionApi ) {
        if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
            return;
        }

        const viewWriter = conversionApi.writer;
        const img = conversionApi.mapper.toViewElement( data.item );

        viewWriter.setAttribute( data.attributeKey, data.attributeNewValue || '', img );
    }
}

export function createImageViewElement( writer ) {
    return  writer.createEmptyElement( 'img' );
}
