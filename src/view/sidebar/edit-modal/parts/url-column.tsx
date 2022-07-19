/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, {
	FC,
	ReactElement,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState
} from 'react';
import { Container, Button, Tooltip, Padding } from '@zextras/carbonio-design-system';
import { UrlColumnProps } from '../../../../types/share-calendar';
import SvgContainer from './svg-container';

export const UrlColumn: FC<UrlColumnProps> = ({
	label,
	tooltip,
	onUrlCopied,
	type
}): ReactElement => {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<Container>
			<SvgContainer type={type} isHovered={isHovered} />
			<Padding top="medium" />
			<Tooltip label={tooltip} placement="top">
				<Container padding={{ horizontal: 'small' }}>
					<Button
						label={label}
						icon="Copy"
						width="fill"
						type="outlined"
						onClick={onUrlCopied(label, type)}
						onMouseEnter={(): void => setIsHovered(true)}
						onMouseLeave={(): void => setIsHovered(false)}
					/>
				</Container>
			</Tooltip>
		</Container>
	);
};
