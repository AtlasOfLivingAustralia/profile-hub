/**
 * Custom CKEditor control to allow images to be uploaded to the profile and/or selected to display inside the attribute
 */
import Plugin from '../../../../thirdparty/ckeditor5/node_modules/@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '../../../../thirdparty/ckeditor5/node_modules/@ckeditor/ckeditor5-ui/src/button/buttonview';
import imageIcon from '../../../../thirdparty/ckeditor5/node_modules/@ckeditor/ckeditor5-core/theme/icons/image.svg';

export default class InsertImage extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'InsertImage';
    }

    init() {
        var editor = this.editor;

        editor.ui.componentFactory.add( 'insertImage', function (locale) {
            var view = new ButtonView( locale );

            view.set( {
                label: 'Insert image',
                icon: imageIcon,
                tooltip: true
            } );

            // Callback executed once the image is clicked.
            view.on( 'execute', function () {
                editor.fire('insertimage', { callback:function (image) {
                        editor.model.change( function (writer) {
                            // var imageElement = writer.createElement( 'image', {
                            //     src: imageUrl,
                            //     alt: altText
                            // } );
                            //
                            // // Insert the image in the current selection location.
                            // editor.model.insertContent( imageElement, editor.model.document.selection );

                            // var htmlDP = new HtmlDataProcessor( viewDocument );
                            var viewFragment = editor.data.processor.toView( image );
                            var modelFragment = editor.data.toModel( viewFragment );

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
                    model: function ( viewImage, ref ) {
                        ref.writer.createElement('image', {
                            src: viewImage.getAttribute('src'),
                            alt: viewImage.getAttribute('alt'),
                            class: viewImage.getAttribute('class')
                        })
                    }
                } );

            // Model-to-view position mapper is needed since the model <infoBox> content needs to end up in the inner
            // <div class="info-box-content">.
            // editor.editing.mapper.on( 'modelToViewPosition', createModelToViewPositionMapper( editor.editing.view ) );
            // editor.data.mapper.on( 'modelToViewPosition', createModelToViewPositionMapper( editor.editing.view ) );
            return view;
        } );
    }
}

function modelToViewAttributeConverter( attributeKey ) {
    return function (dispatcher) {
        dispatcher.on( `attribute:${ attributeKey }:image`, converter );
    };

    function converter( evt, data, conversionApi ) {
        if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
            return;
        }

        var viewWriter = conversionApi.writer;
        var img = conversionApi.mapper.toViewElement( data.item );

        viewWriter.setAttribute( data.attributeKey, data.attributeNewValue || '', img );
    }
}

function createImageViewElement( writer ) {
    return  writer.createEmptyElement( 'img' );
}

function createModelToViewPositionMapper( view ) {
    return function( evt, data ) {
        var modelPosition = data.modelPosition;
        var parent = modelPosition.parent;

        // Only mapping of positions that are directly in
        // the <infoBox> model element should be modified.
        if ( !parent.is( 'element', 'image' ) ) {
            return;
        }

        // Get the mapped view element <div class="info-box">.
        var viewElement = data.mapper.toViewElement( parent );

        // Translate the model position offset to the view position offset.
        data.viewPosition = data.mapper.findPositionIn( viewElement, modelPosition.offset );
    };
}