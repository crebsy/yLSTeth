import React, {Fragment, useCallback, useMemo, useState} from 'react';
import {ImageWithFallback} from 'components/common/ImageWithFallback';
import Toggle from 'components/common/toggle';
import IconChevronPlain from 'components/icons/IconChevronPlain';
import IconSpinner from 'components/icons/IconSpinner';
import useLST from 'contexts/useLST';
import {NO_CHANGE_LST_LIKE} from 'utils/constants';
import {getCurrentEpochNumber} from 'utils/epochs';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {IconChevronBottom} from '@yearn-finance/web-lib/icons/IconChevronBottom';
import {toAddress, truncateHex} from '@yearn-finance/web-lib/utils/address';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {toNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {formatAmount, formatPercent} from '@yearn-finance/web-lib/utils/format.number';
import {performBatchedUpdates} from '@yearn-finance/web-lib/utils/performBatchedUpdates';

import type {TIncentives, TIncentivesFor} from 'hooks/useBootstrapIncentives';
import type {ReactElement} from 'react';
import type {TIndexedTokenInfo, TSortDirection} from 'utils/types';
import type {TDict} from '@yearn-finance/web-lib/types';

function IncentiveGroupBreakdownItem({item}: {item: TIncentives}): ReactElement {
	return (
		<div
			aria-label={'content'}
			className={'grid w-full grid-cols-8 py-2 md:w-[52%]'}>
			<div className={'col-span-2 flex w-full flex-row items-center space-x-2'}>
				<div className={'h-6 w-6 min-w-[24px]'}>
					<ImageWithFallback
						src={item.incentiveToken?.logoURI || ''}
						alt={''}
						unoptimized
						width={24}
						height={24} />
				</div>
				<div>
					<p className={'text-xs'}>
						{item?.incentiveToken?.symbol || truncateHex(item.incentive, 6)}
					</p>
				</div>
			</div>
			<div className={'col-span-2 flex items-center justify-end'}>
				<p suppressHydrationWarning className={'font-number pr-1 text-xxs md:text-xs'}>
					{`${formatAmount(toNormalizedBN(item.amount, item.incentiveToken?.decimals)?.normalized || 0, 6, 6)}`}
				</p>
			</div>
			<div className={'col-span-2 flex items-center justify-end'}>
				<p suppressHydrationWarning className={'font-number pr-1 text-xxs md:text-xs'}>
					{`$${formatAmount(item.value, 2, 2)}`}
				</p>
			</div>
			<div className={'col-span-2 flex items-center justify-end'}>
				<p suppressHydrationWarning className={'font-number pr-1 text-xxs md:text-xs'}>
					{`${formatPercent(item.estimatedAPR, 4)}`}
				</p>
			</div>
		</div>
	);
}

function IncentiveGroupBreakdown({incentives}: {incentives: TIncentives[]}): ReactElement {
	const [sortBy, set_sortBy] = useState<string>('');
	const [sortDirection, set_sortDirection] = useState<TSortDirection>('');

	/* 🔵 - Yearn Finance **************************************************************************
	**	Callback method used to sort the vaults list.
	**	The use of useCallback() is to prevent the method from being re-created on every render.
	**********************************************************************************************/
	const onSort = useCallback((newSortBy: string, newSortDirection: string): void => {
		performBatchedUpdates((): void => {
			set_sortBy(newSortBy);
			set_sortDirection(newSortDirection as TSortDirection);
		});
	}, []);

	/* 🔵 - Yearn Finance **************************************************************************
	**	Callback method used to toggle the sort direction.
	**	By default, the sort direction is descending. If the user clicks on the same column again,
	**	the sort direction will be toggled to ascending. If the user clicks on a different column,
	**	the sort direction will be set to descending.
	**********************************************************************************************/
	const toggleSortDirection = (newSortBy: string): TSortDirection => {
		return sortBy === newSortBy ? (
			sortDirection === '' ? 'desc' : sortDirection === 'desc' ? 'asc' : 'desc'
		) : 'desc';
	};

	/* 🔵 - Yearn Finance **************************************************************************
	**	Callback method used to render the chevron icon.
	**	The chevron color and direction will change depending on the sort direction.
	**********************************************************************************************/
	const renderChevron = useCallback((shouldSortBy: boolean): ReactElement => {
		if (shouldSortBy && sortDirection === 'desc') {
			return <IconChevronPlain className={'yearn--sort-chevron transition-all'} />;
		}
		if (shouldSortBy && sortDirection === 'asc') {
			return <IconChevronPlain className={'yearn--sort-chevron rotate-180 transition-all'} />;
		}
		return <IconChevronPlain className={'yearn--sort-chevron--off text-neutral-300 transition-all group-hover:text-neutral-500'} />;
	}, [sortDirection]);

	return (
		<div className={'border-t border-neutral-300 bg-neutral-100 px-4 pb-2 pt-4 md:px-72'}>
			<div className={'mb-4'}>
				<b className={'text-xs'}>{'Incentives Breakdown'}</b>
			</div>
			<div aria-label={'header'} className={'mb-2 grid w-full grid-cols-8 md:w-[52%]'}>
				<div className={'col-span-2'}>
					<p className={'text-xs text-neutral-500'}>
						{'Token used'}
					</p>
				</div>
				<div className={'col-span-2 flex justify-end'}>
					<p
						onClick={(): void => onSort('amount', toggleSortDirection('amount'))}
						className={'group flex flex-row text-xs text-neutral-500'}>
						{'Amount'}
						<span className={'pl-2'}>
							{renderChevron(sortBy === 'amount')}
						</span>
					</p>
				</div>
				<div className={'col-span-2 flex justify-end'}>
					<p
						onClick={(): void => onSort('usdValue', toggleSortDirection('usdValue'))}
						className={'group flex flex-row text-xs text-neutral-500'}>
						<span className={'hidden md:block'}>{'USD Value'}</span>
						<span className={'block md:hidden'}>{'$ Value'}</span>
						<span className={'pl-2'}>
							{renderChevron(sortBy === 'usdValue')}
						</span>
					</p>
				</div>
				<div className={'col-span-2 flex justify-end'}>
					<p
						onClick={(): void => onSort('apr', toggleSortDirection('apr'))}
						className={'group flex flex-row text-xs text-neutral-500'}>
						{'APR'}
						<span className={'pl-2'}>
							{renderChevron(sortBy === 'apr')}
						</span>
					</p>
				</div>
			</div>
			{[...incentives]
				.sort((a, b): number => {
					let aValue = 0;
					let bValue = 0;
					if (sortBy === 'amount') {
						aValue = Number(toNormalizedBN(a.amount, a.incentiveToken?.decimals)?.normalized);
						bValue = Number(toNormalizedBN(b.amount, b.incentiveToken?.decimals)?.normalized);
					} else if (sortBy === 'usdValue') {
						aValue = a.value;
						bValue = b.value;
					} else if (sortBy === 'apr') {
						aValue = a.estimatedAPR;
						bValue = b.estimatedAPR;
					}
					return sortDirection === 'desc' ? Number(bValue) - Number(aValue) : Number(aValue) - Number(bValue);
				})
				.map((item, index): ReactElement => (<IncentiveGroupBreakdownItem key={index} item={item} />))}
		</div>
	);
}

function IncentiveGroup({item, shouldDisplayUserIncentive}: {item: TIndexedTokenInfo, shouldDisplayUserIncentive: boolean}): ReactElement {
	const {incentives: {groupIncentiveHistory}} = useLST();
	const {safeChainID} = useChainID(Number(process.env.BASE_CHAIN_ID));
	const incentives = groupIncentiveHistory?.[shouldDisplayUserIncentive ? 'user' : 'protocols']?.[item.address] || [];

	if (!item) {
		return (<Fragment />);
	}

	const hasSubIncentives = (incentives.incentives || []).length > 0;
	return (
		<details
			aria-label={'content'}
			className={cl('border-b-2 border-neutral-0 bg-neutral-100/50 transition-colors open:bg-neutral-100', hasSubIncentives ? 'hover:bg-neutral-100' : '')}
			onClick={(e): void => {
				if (!hasSubIncentives) {
					e.preventDefault();
					e.stopPropagation();
				}
			}}>
			<summary className={cl('grid grid-cols-12 p-4 px-0 md:px-72', hasSubIncentives ? 'cursor-pointer' : '!cursor-default')}>
				<div className={'col-span-12 flex w-full flex-row items-center space-x-6 md:col-span-5'}>
					<div className={'h-10 w-10 min-w-[40px]'}>
						<ImageWithFallback
							src={`https://assets.smold.app/api/token/${safeChainID}/${toAddress(item?.address)}/logo-128.png`}
							alt={''}
							unoptimized
							width={40}
							height={40} />
					</div>
					<div className={'flex flex-col'}>
						<p className={'whitespace-nowrap'}>
							{item?.symbol || truncateHex(item.address, 6)}
						</p>
						<small className={'whitespace-nowrap text-xs'}>
							{item.name}
						</small>
					</div>
				</div>
				<div className={'col-span-12 mt-4 flex justify-between md:col-span-2 md:mt-0 md:justify-end'}>
					<small className={'block text-neutral-500 md:hidden'}>
						{'Total incentive (USD)'}
					</small>
					<p suppressHydrationWarning className={'font-number'}>
						{`$${formatAmount(incentives.normalizedSum || 0, 2, 2)}`}
					</p>
				</div>
				<div className={'col-span-12 mt-2 flex justify-between md:col-span-2 md:mt-0 md:justify-end'}>
					<small className={'block text-neutral-500 md:hidden'}>
						{'USD/st-yETH'}
					</small>
					<p suppressHydrationWarning className={'font-number'}>
						{`${formatAmount(incentives.usdPerStETH || 0, 4, 4)}`}
					</p>
				</div>
				<div className={'col-span-12 mt-2 flex justify-between md:col-span-2 md:mt-0 md:justify-end'}>
					<small className={'block text-neutral-500 md:hidden'}>
						{'st-yETH vAPR'}
					</small>
					<p suppressHydrationWarning className={'font-number'}>
						{`${formatPercent(incentives.estimatedAPR, 4)}`}
					</p>
				</div>
				<div className={'col-span-1 hidden justify-end md:flex'}>
					<IconChevronBottom className={cl('chev h-6 w-6 text-neutral-900', !hasSubIncentives ? 'opacity-20' : '')} />
				</div>
			</summary>

			<div className={hasSubIncentives ? 'block' : 'hidden'}>
				<IncentiveGroupBreakdown incentives={incentives.incentives || []} />
			</div>
		</details>
	);
}

function IncentiveHistory({possibleLSTs, isPending, incentives}: {
	possibleLSTs: TDict<TIndexedTokenInfo>;
	isPending: boolean;
	incentives: TIncentivesFor;
}): ReactElement {
	const [sortBy, set_sortBy] = useState<string>('totalIncentive');
	const [sortDirection, set_sortDirection] = useState<TSortDirection>('desc');
	const [, set_epochToDisplay] = useState<number>(getCurrentEpochNumber());
	const [shouldDisplayUserIncentive, set_shouldDisplayUserIncentive] = useState<boolean>(false);

	/* 🔵 - Yearn Finance **************************************************************************
	**	Callback method used to sort the vaults list.
	**	The use of useCallback() is to prevent the method from being re-created on every render.
	**********************************************************************************************/
	const onSort = useCallback((newSortBy: string, newSortDirection: string): void => {
		performBatchedUpdates((): void => {
			set_sortBy(newSortBy);
			set_sortDirection(newSortDirection as TSortDirection);
		});
	}, []);

	const toggleSortDirection = (newSortBy: string): TSortDirection => {
		return sortBy === newSortBy ? (
			sortDirection === '' ? 'desc' : sortDirection === 'desc' ? 'asc' : 'desc'
		) : 'desc';
	};

	const renderChevron = useCallback((shouldSortBy: boolean): ReactElement => {
		if (shouldSortBy && sortDirection === 'desc') {
			return <IconChevronPlain className={'yearn--sort-chevron transition-all'} />;
		}
		if (shouldSortBy && sortDirection === 'asc') {
			return <IconChevronPlain className={'yearn--sort-chevron rotate-180 transition-all'} />;
		}
		return <IconChevronPlain className={'yearn--sort-chevron--off text-neutral-300 transition-all group-hover:text-neutral-500'} />;
	}, [sortDirection]);

	const epochs = useMemo((): number[] => {
		const epochArray = [];
		for (let i = 0; i <= getCurrentEpochNumber(); i++) {
			epochArray.push(i);
		}
		return epochArray;
	}, []);

	return (
		<div className={'mt-2 pt-8'}>

			<div className={'px-4 md:px-72'}>
				<b className={'text-xl font-black'}>
					{'Incentives'}
				</b>

				<div className={'flex flex-col justify-between md:flex-row'}>
					<div>
						<p className={'mb-1 text-neutral-600'}>{'Select epoch'}</p>
						<div className={cl('grow-1 col-span-5 flex h-10 w-full items-center justify-start rounded-md p-2 bg-neutral-0 md:w-[264px] mb-9')}>
							<select
								className={'w-full overflow-x-scroll border-none bg-transparent px-0 py-4 outline-none scrollbar-none'}
								onChange={(e): void => set_epochToDisplay(Number(e.target.value))}
								value={getCurrentEpochNumber()}
								defaultValue={getCurrentEpochNumber()}>
								{epochs.map((index): ReactElement => (
									<option key={index} value={index}>
										{index === getCurrentEpochNumber() ? 'Current' : `Epoch ${index}`}
									</option>
								))}
							</select>
						</div>
					</div>
					<div className={'flex flex-row items-center space-x-2'}>
						<p className={cl(shouldDisplayUserIncentive ? 'font-bold text-purple-300' : 'font-normal text-neutral-600')}>{'Show my incentives'}</p>
						<Toggle
							bgOffColor={'bg-neutral-0'}
							isEnabled={shouldDisplayUserIncentive}
							onChange={(): void => set_shouldDisplayUserIncentive(!shouldDisplayUserIncentive)} />
					</div>
				</div>


				<div aria-label={'header'} className={'my-4 hidden grid-cols-12 md:grid'}>
					<div className={'col-span-5'}>
						<p className={'text-xs text-neutral-500'}>
							{'LST'}
						</p>
					</div>
					<div className={'col-span-2 flex justify-end'}>
						<p
							onClick={(): void => onSort('totalIncentive', toggleSortDirection('totalIncentive'))}
							className={'group flex flex-row text-xs text-neutral-500 md:-mr-2'}>
							{'Total incentive (USD)'}
							<span className={'pl-2'}>
								{renderChevron(sortBy === 'totalIncentive')}
							</span>
						</p>
					</div>
					<div className={'col-span-2 flex justify-end'}>
						<p
							onClick={(): void => onSort('usdPerStETH', toggleSortDirection('usdPerStETH'))}
							className={'group flex flex-row text-xs text-neutral-500 md:-mr-2'}>
							{'USD/st-yETH'}
							<span className={'pl-2'}>
								{renderChevron(sortBy === 'usdPerStETH')}
							</span>
						</p>
					</div>
					<div className={'col-span-2 flex justify-end'}>
						<p
							onClick={(): void => onSort('vapr', toggleSortDirection('vapr'))}
							className={'group flex flex-row text-xs text-neutral-500 md:-mr-2'}>
							{'st-yETH vAPR'}
							<span className={'pl-2'}>
								{renderChevron(sortBy === 'vapr')}
							</span>
						</p>
					</div>
					<div className={'col-span-1 flex justify-end'} />
				</div>
			</div>

			<div className={'bg-neutral-200'}>
				{
					[NO_CHANGE_LST_LIKE, ...Object.values(possibleLSTs)]
						.filter((e): boolean => Boolean(e))
						.sort((lstA, lstB): number => {
							const a = incentives[shouldDisplayUserIncentive ? 'user' : 'protocols'][toAddress(lstA.address)];
							const b = incentives[shouldDisplayUserIncentive ? 'user' : 'protocols'][toAddress(lstB.address)];
							if (!a || !b) {
								return 0;
							}
							let aValue = 0;
							let bValue = 0;
							if (sortBy === 'totalIncentive') {
								aValue = a.normalizedSum;
								bValue = b.normalizedSum;
							} else if (sortBy === 'vapr') {
								aValue = a.estimatedAPR;
								bValue = b.estimatedAPR;
							} else if (sortBy === 'usdPerStETH') {
								aValue = a.usdPerStETH;
								bValue = b.usdPerStETH;
							}
							return sortDirection === 'desc' ? Number(bValue) - Number(aValue) : Number(aValue) - Number(bValue);
						})
						.map((item): ReactElement => (
							<IncentiveGroup key={item.address} item={item} shouldDisplayUserIncentive={shouldDisplayUserIncentive} />
						))}

				{isPending && (
					<div className={'mt-6 flex flex-row items-center justify-center pb-12 pt-6'}>
						<IconSpinner className={'!h-6 !w-6 !text-neutral-400'} />
					</div>
				)}
			</div>
		</div>
	);
}

export {IncentiveHistory};
