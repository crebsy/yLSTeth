import {useMemo} from 'react';
import {ST_YETH_ABI} from 'utils/abi/styETH.abi';
import {useContractRead} from 'wagmi';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {toNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';

function useAPR(): number {
	const {data} = useContractRead({
		address: toAddress(process.env.STYETH_ADDRESS),
		abi: ST_YETH_ABI,
		functionName: 'get_amounts'
	});

	const calculateSecondLeftInWeek = (): number => {
		const d = new Date();
		const start = d.getDate() - d.getDay();
		const end = start + 6;

		const startDate = new Date(d.setDate(start));
		const endDate = new Date(d.setDate(end));
		endDate.setHours(23);
		endDate.setMinutes(59);
		endDate.setSeconds(59);

		return (endDate.getTime() - startDate.getTime()) / 1000;
	};

	const estimatedAPR = useMemo((): number => {
		if (!data) {
			return 0;
		}
		const [, streamingAmount, unlockedAmount] = data;
		const _streamingAmount = toNormalizedBN(streamingAmount);
		const _unlockedAmount = toNormalizedBN(unlockedAmount);
		const secondInYear = 31_557_600; // 365.25 days
		const secondLeftInWeek = calculateSecondLeftInWeek();
		const _estimatedAPR = Number(_streamingAmount.normalized) * secondInYear / secondLeftInWeek / Number(_unlockedAmount.normalized);
		return _estimatedAPR * 100;
	}, [data]);

	return (estimatedAPR);
}

export default useAPR;
