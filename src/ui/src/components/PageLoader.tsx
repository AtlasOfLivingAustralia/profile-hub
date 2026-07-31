import Spinner, { type SpinnerProps } from 'react-bootstrap/Spinner';

interface PageLoaderProps {
	size?: SpinnerProps["size"];
}

export default function PageLoader({ size }: PageLoaderProps) {
	return <div className="w-100 h-100 d-flex justify-content-center align-items-center">
		<Spinner variant='primary' size={size} />
	</div>
}
