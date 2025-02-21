import React, {useMemo} from 'react';
import {RenderAmount} from 'components/common/RenderAmount';
import useLST from 'contexts/useLST';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {toNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';

import type {ReactElement} from 'react';

function DepositDetails({label, estimateOut, bonusOrPenalty, shouldDepositEth}: {
	label: string,
	estimateOut: bigint,
	bonusOrPenalty: number,
	shouldDepositEth: boolean
}): ReactElement {
	const {slippage} = useLST();
	const bonusOrPenaltyFormatted = useMemo((): string => {
		if (Number.isNaN(bonusOrPenalty)) {
			return formatAmount(0, 2, 2);
		}
		if (bonusOrPenalty === 0) {
			return formatAmount(0, 2, 2);
		}
		if (Number(bonusOrPenalty.toFixed(6)) === 0) {
			return formatAmount(0, 2, 2);
		}
		return bonusOrPenalty.toFixed(6);
	}, [bonusOrPenalty]);

	return (
		<div className={'col-span-12 py-6 pl-0 md:py-10 md:pl-72'}>
			<div className={'mb-10 flex w-full flex-col !rounded-md bg-neutral-100'}>
				<h2 className={'text-xl font-black'}>
					{'Details'}
				</h2>
				<dl className={'grid grid-cols-3 gap-2 pt-4'}>
					<dt className={'col-span-2'}>{`Est. ${label}`}</dt>
					<dd
						suppressHydrationWarning
						className={cl('text-right font-bold', (shouldDepositEth && -Number(bonusOrPenaltyFormatted) > 0.03) || (!shouldDepositEth && -Number(bonusOrPenaltyFormatted) > 1) ? 'text-red-900' : '')}>
						{Number(bonusOrPenaltyFormatted) === -100 ? 'Out of bands' : `${formatAmount(bonusOrPenaltyFormatted, 2, 6)}%`}
					</dd>

					<dt className={'col-span-2'}>{'Minimum yETH amount'}</dt>
					<dd suppressHydrationWarning className={'text-right font-bold'}>
						<RenderAmount
							value={Number(toNormalizedBN(estimateOut).normalized)}
							decimals={6} />
					</dd>

					{shouldDepositEth && (
						<>
							<dt className={'col-span-2'}>{'Slippage tolerance'}</dt>
							<dd suppressHydrationWarning className={'text-right font-bold'}>
								{`${formatAmount(Number(slippage) / 100, 2, 2)}%`}
							</dd>
						</>
					)}
				</dl>
			</div>
			<div className={shouldDepositEth ? 'pt-2' : ''}>
				<h2 className={'text-xl font-black'}>
					{'Info'}
				</h2>
				<p className={'whitespace-break-spaces pt-4 text-neutral-600'}>
					{shouldDepositEth ? 'Deposit vanilla ETH via a Curve Swap to receive yETH' : 'Deposit any of the 5 LSTs (in any combination) to receive yETH. Or you can deposit and stake to receive st-yETH and immediately start earning that sweet, sweet liquid staking yield.'}
				</p>
				{shouldDepositEth && (
					<p className={'whitespace-break-spaces pt-4 text-neutral-600'}>
						{'When you deposit ETH for yETH, we use the '}
						<a
							href={`https://etherscan.io/adddress/${process.env.CURVE_SWAP_ADDRESS}`}
							className={'underline'}
							target={'_blank'}>
							{'Curve Swap Contract'}
						</a>
						{' with the '}
						<a
							href={`https://etherscan.io/adddress/${process.env.CURVE_YETH_POOL_ADDRESS}`}
							className={'underline'}
							target={'_blank'}>
							{'yETH Factory pool'}
						</a>
						{'. Alternatively, you can use '}
						<a
							href={'https://swap.cow.fi/#/1/swap/WETH/yETH'}
							className={'underline'}
							target={'_blank'}>
							{'CoWSwap'}
						</a>
						{'.'}
					</p>
				)}
			</div>
		</div>
	);
}

export {DepositDetails};
