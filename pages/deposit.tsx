import React from 'react';
import Deposit from 'components/bootstrapViews/Deposit';

import type {ReactElement} from 'react';

export default function DepositPage(): ReactElement {
	return (
		<div className={'relative mx-auto mb-0 flex min-h-screen w-full flex-col bg-neutral-0 pt-20'}>
			<div className={'relative mx-auto w-full max-w-5xl'}>
				<Deposit />
			</div>
		</div>
	);
}
